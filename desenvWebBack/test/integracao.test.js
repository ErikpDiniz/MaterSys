const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
require("../src/configs/load-env");
const modelos = require("../src/models");
const { criarApp } = require("../src/app");
const bcrypt = require("bcryptjs");

test("Integração PostgreSQL: login, permissões e CRUD das três entidades", { skip: !process.env.DB_NAME, timeout: 60000 }, async t => {
  const server = criarApp(modelos).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = "http://127.0.0.1:" + server.address().port;
  const prefix = "teste-" + Date.now();
  const criados = { usuarios: [], planos: [], contratos: [] };
  async function api(path, method = "GET", body, token) {
    const response = await fetch(base + path, {
      method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  }
  try {
    await t.test("Banco conectado e rotas privadas protegidas", async () => {
      assert.equal((await api("/health")).status, 200);
      assert.equal((await api("/usuarios")).status, 401);
      assert.equal((await api("/planos")).status, 401);
      assert.equal((await api("/contratos")).status, 401);
      assert.equal((await api("/usuarios", "GET", undefined, "token-falso")).status, 401);
    });
    await t.test("Credenciais inválidas não autenticam", async () => {
      assert.equal((await api("/login", "POST", { email: "inexistente@teste.com", senha: "errada" })).status, 401);
      assert.equal((await api("/login", "POST", { email: { teste: true }, senha: "123456" })).status, 400);
    });
    const login = await api("/login", "POST", {
      email: process.env.ADMIN_SEED_EMAIL || "admin@teste.com",
      senha: process.env.ADMIN_SEED_PASSWORD || "123456",
    });
    assert.equal(login.status, 200, "Execute npm run db:seed antes dos testes.");
    const admin = login.body.token;
    await t.test("Login retorna sessão válida e nunca retorna hash da senha", async () => {
      assert.ok(admin && admin !== "token-fake-123");
      assert.equal(login.body.usuario.perfil, "ADMIN");
      assert.equal(login.body.usuario.senha, undefined);
      assert.equal((await api("/auth/me", "GET", undefined, admin)).status, 200);
      assert.equal((await api("/usuarios", "GET", undefined, admin)).body.some(u => u.senha), false);
    });
    const usuario = await api("/usuarios", "POST", { nome: "Aluno de teste", email: prefix + "@teste.com", senha: "123456", perfil: "ALUNO" }, admin);
    assert.equal(usuario.status, 201);
    criados.usuarios.push(usuario.body.id);
    await t.test("Cadastro salva hash, valida campos e impede duplicidade", async () => {
      assert.equal(usuario.body.senha, undefined);
      const salvo = await modelos.Usuario.scope("comSenha").findByPk(usuario.body.id);
      assert.notEqual(salvo.senha, "123456");
      assert.equal(await bcrypt.compare("123456", salvo.senha), true);
      assert.equal((await api("/usuarios", "POST", { nome: "Duplicado", email: prefix + "@teste.com", senha: "123456" }, admin)).status, 409);
      assert.equal((await api("/usuarios", "POST", { nome: "Inválido", email: "invalido", senha: "123456" }, admin)).status, 400);
    });
    const loginAluno = await api("/login", "POST", { email: prefix + "@teste.com", senha: "123456" });
    const aluno = loginAluno.body.token;
    const plano = await api("/planos", "POST", { nome: prefix, valor_mensal: "180.50", limite_modalidades: 2 }, admin);
    assert.equal(plano.status, 201);
    criados.planos.push(plano.body.id);
    await t.test("Aluno consulta planos, mas não administra cadastros", async () => {
      assert.equal((await api("/planos", "GET", undefined, aluno)).status, 200);
      assert.equal((await api("/usuarios", "GET", undefined, aluno)).status, 403);
      assert.equal((await api("/planos", "POST", { nome: "Proibido", valor_mensal: 1 }, aluno)).status, 403);
      assert.equal((await api("/planos", "POST", { nome: "Negativo", valor_mensal: -1 }, admin)).status, 400);
    });
    const contrato = await api("/contratos", "POST", {
      usuario_id: usuario.body.id, plano_id: plano.body.id, data_inicio: "2026-01-01", data_fim: "2026-12-31",
    }, admin);
    assert.equal(contrato.status, 201);
    criados.contratos.push(contrato.body.id);
    await t.test("Contrato usa valor do plano e valida conta do aluno e datas", async () => {
      assert.equal(Number(contrato.body.valor_mensal), 180.5);
      assert.equal((await api("/contratos", "POST", { usuario_id: login.body.usuario.id, plano_id: plano.body.id, data_inicio: "2026-01-01", data_fim: "2026-12-31" }, admin)).status, 400);
      assert.equal((await api("/contratos/" + contrato.body.id, "PUT", { data_fim: "2025-12-31" }, admin)).status, 400);
      assert.equal((await api("/contratos/" + contrato.body.id, "PUT", { data_inicio: "2026-02-30" }, admin)).status, 400);
    });
    await t.test("Aluno acessa somente seus próprios contratos", async () => {
      const lista = await api("/contratos", "GET", undefined, aluno);
      assert.equal(lista.status, 200);
      assert.equal(lista.body.length, 1);
      assert.equal(lista.body[0].id, contrato.body.id);
      assert.equal(lista.body[0].aluno.senha, undefined);
      const outro = await modelos.Contrato.findOne({ where: { observacoes: "Contrato demonstrativo IRONGATE" } });
      assert.ok(outro);
      assert.equal((await api("/contratos/" + outro.id, "GET", undefined, aluno)).status, 404);
    });
    await t.test("Preço do contrato preservado e chaves estrangeiras protegidas", async () => {
      assert.equal((await api("/planos/" + plano.body.id, "PUT", { valor_mensal: "250.00" }, admin)).status, 200);
      assert.equal(Number((await api("/contratos/" + contrato.body.id, "GET", undefined, admin)).body.valor_mensal), 180.5);
      assert.equal((await api("/planos/" + plano.body.id, "DELETE", undefined, admin)).status, 409);
      assert.equal((await api("/planos/" + plano.body.id, "PUT", { ativo: false }, admin)).status, 200);
      assert.equal((await api("/contratos/" + contrato.body.id, "PUT", { plano_id: plano.body.id, status: "CANCELADO" }, admin)).status, 200);
      assert.equal((await api("/usuarios/" + usuario.body.id, "DELETE", undefined, admin)).status, 409);
    });
    await t.test("Edição do usuário e revogação de sessão ao desativar", async () => {
      assert.equal((await api("/usuarios/" + usuario.body.id, "PUT", { nome: "Aluno alterado", ativo: false }, admin)).status, 200);
      assert.equal((await api("/auth/me", "GET", undefined, aluno)).status, 401);
      assert.equal((await api("/contratos/" + contrato.body.id, "PUT", { usuario_id: usuario.body.id, status: "ENCERRADO" }, admin)).status, 200);
      assert.equal((await api("/login", "POST", { email: prefix + "@teste.com", senha: "123456" })).status, 401);
      assert.equal((await api("/usuarios/" + login.body.usuario.id, "PUT", { ativo: false }, admin)).status, 400);
    });
    await t.test("Exclusão na ordem correta remove somente as fixtures de teste", async () => {
      for (const nome of ["contratos", "planos", "usuarios"]) {
        for (const id of criados[nome]) assert.equal((await api("/" + nome + "/" + id, "DELETE", undefined, admin)).status, 204);
      }
    });
  } finally {
    // Apenas os IDs criados por este teste; nunca apaga os seeds nem outros cadastros.
    for (const [nome, model] of [["contratos", modelos.Contrato], ["planos", modelos.Plano], ["usuarios", modelos.Usuario]]) {
      if (criados[nome].length) await model.destroy({ where: { id: criados[nome] } });
    }
    await new Promise(resolve => server.close(resolve));
    await modelos.sequelize.close();
  }
});
