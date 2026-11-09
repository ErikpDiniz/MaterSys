require("../configs/load-env");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function criarAuthService({ Usuario }) {
  function secret() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres no .env.");
    }
    return process.env.JWT_SECRET;
  }
  function publico(usuario) {
    const { id, nome, email, perfil, ativo } = usuario;
    return { id, nome, email, perfil, ativo };
  }
  return {
    async autenticar(email, senha) {
      const usuario = await Usuario.scope("comSenha").findOne({ where: { email: email.trim().toLowerCase() } });
      if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senha))) return null;
      const token = jwt.sign({}, secret(), { subject: String(usuario.id), expiresIn: "2h", algorithm: "HS256" });
      return { autenticado: true, token, usuario: publico(usuario) };
    },
    async verificar(token) {
      const payload = jwt.verify(token, secret(), { algorithms: ["HS256"] });
      const usuario = await Usuario.findByPk(payload.sub);
      return usuario && usuario.ativo ? publico(usuario) : null;
    },
  };
}
module.exports = criarAuthService;
