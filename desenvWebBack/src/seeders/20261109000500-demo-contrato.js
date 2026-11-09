module.exports = {
  async up(q) {
    if (process.env.NODE_ENV === "production") throw new Error("Seed de demonstração permitido apenas em desenvolvimento/teste.");
    const [[usuario]] = await q.sequelize.query("SELECT id FROM usuarios WHERE email = :email", { replacements: { email: "aluno@teste.com" } });
    const [[plano]] = await q.sequelize.query("SELECT id, valor_mensal FROM planos WHERE nome = :nome", { replacements: { nome: "Premium" } });
    if (!usuario || !plano) throw new Error("Execute primeiro os seeds de usuários e planos.");
    const now = new Date();
    await q.bulkInsert("contratos", [{
      usuario_id: usuario.id, plano_id: plano.id, data_inicio: "2026-01-01", data_fim: "2026-12-31",
      valor_mensal: plano.valor_mensal, status: "ATIVO", data_assinatura: "2026-01-01",
      observacoes: "Contrato demonstrativo IRONGATE", created_at: now, updated_at: now,
    }]);
  },
  async down(q) { await q.bulkDelete("contratos", { observacoes: "Contrato demonstrativo IRONGATE" }, {}); },
};
