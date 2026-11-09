import { requisicao } from "./api";
export const autenticar = (email, senha) => requisicao("/login", { method: "POST", body: { email, senha }, autenticado: false });
export const consultarSessao = () => requisicao("/auth/me");
