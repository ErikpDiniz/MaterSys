const baseURL = import.meta.env.VITE_API_URL || "/api";
export async function requisicao(path, { method = "GET", body, autenticado = true } = {}) {
  const token = sessionStorage.getItem("matersys.token");
  let resposta;
  try {
    resposta = await fetch(baseURL + path, {
      method,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(autenticado && token ? { Authorization: "Bearer " + token } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Confira se o backend está aberto.");
  }
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    if (resposta.status === 401 && autenticado) window.dispatchEvent(new Event("sessao-expirada"));
    throw new Error(dados.mensagem || "Não foi possível concluir a solicitação.");
  }
  return dados;
}
