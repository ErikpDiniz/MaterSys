import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault();
    setErro(""); setEnviando(true);
    try { await login(email, senha); navigate("/home", { replace: true }); }
    catch (error) { setErro(error.message); }
    finally { setEnviando(false); }
  }
  return <main className="login-layout">
    <section className="brand-panel" aria-label="IRONGATE Academia">
      <a className="brand" href="/"><span className="brand-mark" aria-hidden="true">IG</span><span>IRON<span className="red">GATE</span><small>ACADEMIA DE ARTES MARCIAIS</small></span></a>
      <div className="brand-message"><p className="eyebrow">DISCIPLINA. FORÇA. EVOLUÇÃO.</p><h1>Sua próxima<br />conquista<br /><span>começa aqui.</span></h1><p>Um espaço para evoluir dentro e fora do tatame.</p><div className="disciplines"><span>JIU-JITSU</span><span>MUAY THAI</span><span>BOXE</span></div></div>
      <p className="brand-footer">IRONGATE ACADEMIA <span>RESPEITO EM CADA MOVIMENTO.</span></p>
    </section>
    <section className="login-panel">
      <div className="login-card"><p className="eyebrow red">BEM-VINDO À IRONGATE</p><h2>Entre na sua conta</h2><p className="muted">Acesse seu espaço na academia.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} disabled={enviando} />
          <label htmlFor="senha">Senha</label><div className="password-field"><input id="senha" name="senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={senha} onChange={e => setSenha(e.target.value)} required maxLength={72} disabled={enviando} /><button type="button" className="password-toggle" aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} aria-pressed={mostrarSenha} onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? "Ocultar" : "Mostrar"}</button></div>
          {erro && <p className="notice error" role="alert">{erro}</p>}
          <button className="primary login-submit" type="submit" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"} <span aria-hidden="true">→</span></button>
        </form><p className="login-help">Precisa de acesso? Fale com a recepção da academia.</p>
      </div><p className="login-footer">IRONGATE · SISTEMA DE GESTÃO</p>
    </section>
  </main>;
}
