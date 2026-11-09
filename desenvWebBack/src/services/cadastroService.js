const bcrypt = require("bcryptjs");
function erro(mensagem, status = 400) { return Object.assign(new Error(mensagem), { status }); }
function id(valor) {
  if (!/^[1-9]\d*$/.test(String(valor)) || (!Number.isSafeInteger(Number(valor)) || Number(valor) > 2147483647)) throw erro("Identificador inválido.");
  return Number(valor);
}
function texto(valor, campo, max, vazio = false) {
  if (typeof valor !== "string" || (!vazio && !valor.trim()) || valor.trim().length > max) throw erro(campo + " inválido.");
  return valor.trim();
}
function dinheiro(valor) {
  if (!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(valor))) throw erro("Informe um valor positivo com até duas casas decimais.");
  return Number(valor).toFixed(2);
}
function data(valor, campo) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    || Number.isNaN(Date.parse(valor)) || new Date(valor).toISOString().slice(0, 10) !== valor) throw erro(campo + " inválida.");
  return valor;
}
function booleano(valor) { if (typeof valor !== "boolean") throw erro("Ativo deve ser verdadeiro ou falso."); return valor; }

module.exports = function criarCadastroService({ Usuario, Plano, Contrato }) {
  async function buscar(model, valor) {
    const registro = await model.findByPk(id(valor));
    if (!registro) throw erro("Registro não encontrado.", 404);
    return registro;
  }
  async function dadosUsuario(body, novo) {
    const d = {};
    if (novo || body.nome !== undefined) d.nome = texto(body.nome, "Nome", 255);
    if (novo || body.email !== undefined) d.email = texto(body.email, "Email", 255).toLowerCase();
    if (novo || body.senha !== undefined) {
      if (typeof body.senha !== "string" || body.senha.length < 6 || Buffer.byteLength(body.senha, "utf8") > 72) throw erro("A senha deve ter no mínimo 6 caracteres e no máximo 72 bytes.");
      d.senha = await bcrypt.hash(body.senha, 10);
    }
    if (body.perfil !== undefined) {
      if (!["ADMIN", "TREINADOR", "ALUNO"].includes(body.perfil)) throw erro("Perfil inválido.");
      d.perfil = body.perfil;
    }
    if (body.ativo !== undefined) d.ativo = booleano(body.ativo);
    return d;
  }
  function dadosPlano(body, novo) {
    const d = {};
    if (novo || body.nome !== undefined) d.nome = texto(body.nome, "Nome", 100);
    if (novo || body.valor_mensal !== undefined) d.valor_mensal = dinheiro(body.valor_mensal);
    if (body.descricao !== undefined) d.descricao = texto(body.descricao, "Descrição", 5000, true);
    if (body.limite_modalidades !== undefined) d.limite_modalidades = body.limite_modalidades === null ? null : id(body.limite_modalidades);
    if (body.ativo !== undefined) d.ativo = booleano(body.ativo);
    return d;
  }
  async function dadosContrato(body, atual) {
    const novo = !atual;
    const d = {};
    if (novo || body.usuario_id !== undefined) {
      const aluno = await buscar(Usuario, body.usuario_id);
      if ((aluno.perfil !== "ALUNO" || !aluno.ativo) && (novo || aluno.id !== atual.usuario_id)) throw erro("Selecione a conta de um aluno ativo.");
      d.usuario_id = aluno.id;
    }
    let plano;
    if (novo || body.plano_id !== undefined) {
      plano = await buscar(Plano, body.plano_id);
      if (!plano.ativo && (novo || plano.id !== atual.plano_id)) throw erro("Selecione um plano ativo.");
      d.plano_id = plano.id;
    }
    if (novo || body.data_inicio !== undefined) d.data_inicio = data(body.data_inicio, "Data inicial");
    if (novo || body.data_fim !== undefined) d.data_fim = data(body.data_fim, "Data final");
    if ((d.data_fim || atual?.data_fim) < (d.data_inicio || atual?.data_inicio)) throw erro("A data final deve ser igual ou posterior à inicial.");
    if (body.valor_mensal !== undefined) d.valor_mensal = dinheiro(body.valor_mensal);
    else if (novo) d.valor_mensal = plano.valor_mensal;
    if (body.status !== undefined) {
      if (!["ATIVO", "CANCELADO", "ENCERRADO"].includes(body.status)) throw erro("Status inválido.");
      d.status = body.status;
    }
    if (body.data_assinatura !== undefined) d.data_assinatura = body.data_assinatura === null ? null : data(body.data_assinatura, "Data da assinatura");
    if (body.observacoes !== undefined) d.observacoes = texto(body.observacoes, "Observações", 5000, true);
    return d;
  }
  const includes = [
    { model: Usuario, as: "aluno", attributes: ["id", "nome", "email"] },
    { model: Plano, as: "plano" },
  ];
  return {
    id, buscar,
    usuarios: {
      listar: () => Usuario.findAll({ order: [["id", "ASC"]] }),
      obter: (valor) => buscar(Usuario, valor),
      async criar(body) {
        const usuario = await Usuario.create(await dadosUsuario(body, true));
        return Usuario.findByPk(usuario.id);
      },
      async atualizar(valor, body, autor) {
        const usuario = await buscar(Usuario, valor);
        if (usuario.id === autor.id && ((body.perfil !== undefined && body.perfil !== "ADMIN") || body.ativo === false)) throw erro("Você não pode remover seu próprio acesso de administrador.");
        await usuario.update(await dadosUsuario(body, false));
        return Usuario.findByPk(usuario.id);
      },
      async excluir(valor, autor) {
        const usuario = await buscar(Usuario, valor);
        if (usuario.id === autor.id) throw erro("Você não pode excluir sua própria conta.");
        await usuario.destroy();
      },
    },
    planos: {
      listar: () => Plano.findAll({ order: [["id", "ASC"]] }),
      obter: (valor) => buscar(Plano, valor),
      criar: async (body) => Plano.create(dadosPlano(body, true)),
      async atualizar(valor, body) {
        const plano = await buscar(Plano, valor);
        return plano.update(dadosPlano(body, false));
      },
      async excluir(valor) { await (await buscar(Plano, valor)).destroy(); },
    },
    contratos: {
      listar: (usuario) => Contrato.findAll({
        where: usuario.perfil === "ADMIN" ? {} : { usuario_id: usuario.id },
        include: includes, order: [["id", "ASC"]],
      }),
      async obter(valor, usuario) {
        const contrato = await Contrato.findByPk(id(valor), { include: includes });
        if (!contrato || (usuario.perfil !== "ADMIN" && contrato.usuario_id !== usuario.id)) throw erro("Contrato não encontrado.", 404);
        return contrato;
      },
      criar: async (body) => Contrato.create(await dadosContrato(body)),
      async atualizar(valor, body) {
        const contrato = await buscar(Contrato, valor);
        return contrato.update(await dadosContrato(body, contrato));
      },
      async excluir(valor) { await (await buscar(Contrato, valor)).destroy(); },
    },
  };
};
