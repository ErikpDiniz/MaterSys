import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { requisicao } from "../services/api";
const dinheiro = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = value => value ? value.split("-").reverse().join("/") : "—";
const titulos = { usuarios: "Usuários", planos: "Planos", contratos: "Contratos" };
const padroes = {
  usuarios: { nome: "", email: "", senha: "", perfil: "ALUNO", ativo: true },
  planos: { nome: "", descricao: "", valor_mensal: "", limite_modalidades: "", ativo: true },
  contratos: { usuario_id: "", plano_id: "", data_inicio: "", data_fim: "", valor_mensal: "", status: "ATIVO", data_assinatura: "", observacoes: "" },
};
export default function Home() {
  const { usuario, logout } = useAuth();
  const admin = usuario.perfil === "ADMIN";
  const [aba, setAba] = useState("planos");
  const [dados, setDados] = useState({ usuarios: [], planos: [], contratos: [] });
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(null);
  const [edicao, setEdicao] = useState(null);
  async function carregar() {
    setCarregando(true);
    try {
      const nomes = admin ? ["usuarios", "planos", "contratos"] : ["planos", "contratos"];
      const listas = await Promise.all(nomes.map(nome => requisicao("/" + nome)));
      setDados(Object.fromEntries(nomes.map((nome, i) => [nome, listas[i]])));
      setErro("");
    } catch (error) { setErro(error.message); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, [admin]);
  function abrir(registro) {
    setErro(""); setAviso(""); setEdicao(registro?.id || null);
    setForm({ ...padroes[aba], ...registro, ...(aba === "usuarios" ? { senha: "" } : {}) });
  }
  const campo = (nome, valor) => setForm(atual => ({ ...atual, [nome]: valor }));
  async function salvar(event) {
    event.preventDefault(); setSalvando(true); setErro(""); setAviso("");
    const body = { ...form };
    for (const key of ["id", "created_at", "updated_at", "aluno", "plano"]) delete body[key];
    if (aba === "usuarios" && edicao && !body.senha) delete body.senha;
    if (aba === "planos") body.limite_modalidades = body.limite_modalidades === "" ? null : Number(body.limite_modalidades);
    if (aba === "contratos") {
      body.usuario_id = Number(body.usuario_id); body.plano_id = Number(body.plano_id);
      body.data_assinatura = body.data_assinatura || null;
      if (body.valor_mensal === "") delete body.valor_mensal;
    }
    try {
      await requisicao("/" + aba + (edicao ? "/" + edicao : ""), { method: edicao ? "PUT" : "POST", body });
      setForm(null); await carregar(); setAviso("Registro salvo com sucesso.");
    } catch (error) { setErro(error.message); }
    finally { setSalvando(false); }
  }
  async function excluir(registro) {
    if (!window.confirm("Excluir este registro? Esta ação não pode ser desfeita.")) return;
    setSalvando(true); setErro(""); setAviso("");
    try { await requisicao("/" + aba + "/" + registro.id, { method: "DELETE" }); await carregar(); setAviso("Registro excluído."); }
    catch (error) { setErro(error.message); }
    finally { setSalvando(false); }
  }
  function input(nome, label, type = "text", required = true, extra = {}) {
    return <label className="field">{label}<input type={type} value={form[nome] ?? ""} onChange={e => campo(nome, e.target.value)} required={required} {...extra} /></label>;
  }
  function select(nome, label, opcoes) {
    return <label className="field">{label}<select value={form[nome]} onChange={e => campo(nome, e.target.value)} required><option value="" disabled>Selecione</option>{opcoes.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></label>;
  }
  const linhas = dados[aba] || [];
  return <div className="dashboard">
    <aside className="sidebar"><a href="/home" className="brand">IRON<span className="red">GATE</span></a><p className="eyebrow muted">ACADEMIA</p><div className="sidebar-user"><strong>{usuario.nome}</strong><span>{admin ? "Administrador" : usuario.perfil === "ALUNO" ? "Aluno" : "Treinador"}</span></div>
      <nav aria-label="Menu principal">{Object.entries(titulos).filter(([nome]) => admin || nome !== "usuarios").map(([nome, titulo]) => <button key={nome} aria-current={aba === nome ? "page" : undefined} className={aba === nome ? "active" : ""} onClick={() => { setAba(nome); setForm(null); setErro(""); setAviso(""); }}>{titulo}</button>)}</nav><button className="logout" onClick={logout}>Sair da conta</button>
    </aside>
    <main className="workspace"><header className="workspace-header"><div><p className="eyebrow red">SEU ESPAÇO NA IRONGATE</p><h1>{titulos[aba]}</h1><p className="muted">{admin ? "Gerencie os cadastros da academia." : "Consulte os planos e seus contratos."}</p></div>{admin && !form && <button className="primary" disabled={carregando} onClick={() => abrir()}>+ Novo registro</button>}</header>
      {erro && <p className="notice error" role="alert">{erro}</p>}{aviso && <p className="notice success" role="status">{aviso}</p>}
      {form ? <section className="editor"><h2>{edicao ? "Editar" : "Novo"} registro</h2><form onSubmit={salvar}><fieldset disabled={salvando}><div className="form-grid">
        {aba === "usuarios" && <>{input("nome", "Nome", "text", true, { maxLength: 255 })}{input("email", "Email", "email", true, { maxLength: 255 })}{input("senha", edicao ? "Nova senha (opcional)" : "Senha", "password", !edicao, { minLength: 6, maxLength: 72, autoComplete: "new-password" })}{select("perfil", "Perfil", [["ALUNO", "Aluno"], ["TREINADOR", "Treinador"], ["ADMIN", "Administrador"]])}</>}
        {aba === "planos" && <>{input("nome", "Nome", "text", true, { maxLength: 100 })}{input("valor_mensal", "Mensalidade (R$)", "number", true, { min: 0, max: 99999999.99, step: "0.01" })}{input("limite_modalidades", "Limite de modalidades (vazio = ilimitado)", "number", false, { min: 1, step: 1 })}{input("descricao", "Descrição", "text", false, { maxLength: 5000 })}</>}
        {aba === "contratos" && <>{select("usuario_id", "Conta do aluno", dados.usuarios.filter(u => u.perfil === "ALUNO" && (u.ativo || u.id === Number(form.usuario_id))).map(u => [u.id, u.nome]))}{select("plano_id", "Plano", dados.planos.filter(p => p.ativo || p.id === Number(form.plano_id)).map(p => [p.id, p.nome]))}{input("data_inicio", "Início", "date")}{input("data_fim", "Término", "date", true, { min: form.data_inicio || undefined })}{input("valor_mensal", "Mensalidade (vazio = preço atual do plano)", "number", false, { min: 0, max: 99999999.99, step: "0.01" })}{select("status", "Situação", [["ATIVO", "Ativo"], ["CANCELADO", "Cancelado"], ["ENCERRADO", "Encerrado"]])}{input("data_assinatura", "Data da assinatura", "date", false)}{input("observacoes", "Observações", "text", false, { maxLength: 5000 })}</>}
        {aba !== "contratos" && <label className="checkbox"><input type="checkbox" checked={form.ativo} onChange={e => campo("ativo", e.target.checked)} />Cadastro ativo</label>}
      </div><div className="form-actions"><button className="primary" type="submit">{salvando ? "Salvando…" : "Salvar registro"}</button><button type="button" className="secondary" onClick={() => { setForm(null); setErro(""); }}>Cancelar</button></div></fieldset></form></section>
      : carregando ? <p role="status">Carregando cadastros…</p> : <>
        <div className="section-info"><span>{linhas.length} {linhas.length === 1 ? "registro" : "registros"}</span><button className="text-button" onClick={carregar}>Atualizar</button></div>
        {!linhas.length ? <div className="empty-state"><h2>Nenhum registro por aqui</h2><p className="muted">{admin ? "Comece adicionando um novo cadastro." : "Seus contratos aparecerão aqui após o cadastro pela academia."}</p></div>
        : <div className="records">{linhas.map(registro => <article key={registro.id} className="record">
          <div className="record-top"><span className="eyebrow muted">{aba === "contratos" ? "CONTRATO #" + registro.id : aba === "planos" ? "PLANO" : registro.perfil}</span><span className={"badge " + ((registro.ativo === false || registro.status === "CANCELADO" || registro.status === "ENCERRADO") ? "inactive" : "")}>{aba === "contratos" ? registro.status : registro.ativo ? "ATIVO" : "INATIVO"}</span></div>
          <h2>{aba === "contratos" ? registro.aluno?.nome : registro.nome}</h2>
          {aba === "usuarios" && <p className="muted">{registro.email}</p>}
          {aba === "planos" && <><p className="price">{dinheiro(registro.valor_mensal)}<small>/mês</small></p><p className="muted">{registro.descricao || "Sem descrição."}</p><p>{registro.limite_modalidades === null ? "Modalidades ilimitadas" : registro.limite_modalidades + " modalidade(s)"}</p></>}
          {aba === "contratos" && <><p>{registro.plano?.nome} · {dinheiro(registro.valor_mensal)}/mês</p><p className="muted">{data(registro.data_inicio)} a {data(registro.data_fim)}</p></>}
          {admin && <div className="record-actions"><button className="secondary" onClick={() => abrir(registro)}>Editar</button><button className="text-button danger" disabled={salvando || (aba === "usuarios" && registro.id === usuario.id)} onClick={() => excluir(registro)}>Excluir</button></div>}
        </article>)}</div>}
      </>}
    </main>
  </div>;
}
