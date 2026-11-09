import { createContext, useContext, useEffect, useState } from "react";
import { autenticar, consultarSessao } from "../services/authService";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  function logout() {
    sessionStorage.removeItem("matersys.token");
    setUsuario(null);
  }
  useEffect(() => {
    let ativo = true;
    window.addEventListener("sessao-expirada", logout);
    if (sessionStorage.getItem("matersys.token")) {
      consultarSessao().then(dados => { if (ativo) setUsuario(dados.usuario); })
        .catch(() => { if (ativo) logout(); })
        .finally(() => { if (ativo) setCarregando(false); });
    } else setCarregando(false);
    return () => { ativo = false; window.removeEventListener("sessao-expirada", logout); };
  }, []);
  async function login(email, senha) {
    const dados = await autenticar(email, senha);
    sessionStorage.setItem("matersys.token", dados.token);
    setUsuario(dados.usuario);
  }
  return <AuthContext.Provider value={{ usuario, logado: Boolean(usuario), carregando, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
