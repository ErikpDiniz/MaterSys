module.exports = (auth) => ({
  async login(req, res, next) {
    const { email, senha } = req.body || {};
    if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha || Buffer.byteLength(senha, "utf8") > 72) {
      return res.status(400).json({ mensagem: "Informe email e senha válidos." });
    }
    try {
      const resultado = await auth.autenticar(email, senha);
      if (!resultado) return res.status(401).json({ mensagem: "Email ou senha inválidos." });
      res.json(resultado);
    } catch (error) { next(error); }
  },
});
