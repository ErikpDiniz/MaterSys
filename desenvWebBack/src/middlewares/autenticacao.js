module.exports = (auth) => ({
  async autenticar(req, res, next) {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ mensagem: "Faça login para continuar." });
    try {
      req.usuario = await auth.verificar(token);
      if (!req.usuario) return res.status(401).json({ mensagem: "Sessão inválida. Entre novamente." });
      next();
    } catch (error) {
      if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
        return res.status(401).json({ mensagem: "Sessão inválida ou expirada. Entre novamente." });
      }
      next(error);
    }
  },
  administrador(req, res, next) {
    if (req.usuario.perfil !== "ADMIN") return res.status(403).json({ mensagem: "Acesso permitido apenas ao administrador." });
    next();
  },
});
