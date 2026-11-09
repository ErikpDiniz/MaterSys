require("../configs/load-env");
const bcrypt = require("bcryptjs");
module.exports = {
  async up(q) {
    if (process.env.NODE_ENV === "production") throw new Error("Seed de demonstração permitido apenas em desenvolvimento/teste.");
    const now = new Date();
    await q.bulkInsert("usuarios", [
      { nome: "Administrador", email: process.env.ADMIN_SEED_EMAIL || "admin@teste.com",
        senha: await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || "123456", 10), perfil: "ADMIN", ativo: true, created_at: now, updated_at: now },
      { nome: "Aluno Demonstração", email: "aluno@teste.com",
        senha: await bcrypt.hash("123456", 10), perfil: "ALUNO", ativo: true, created_at: now, updated_at: now },
    ]);
  },
  async down(q) {
    await q.bulkDelete("usuarios", { email: [process.env.ADMIN_SEED_EMAIL || "admin@teste.com", "aluno@teste.com"] }, {});
  },
};
