module.exports = {
  async up(q) {
    if (process.env.NODE_ENV === "production") throw new Error("Seed de demonstração permitido apenas em desenvolvimento/teste.");
    const now = new Date();
    await q.bulkInsert("planos", [
      { nome: "Básico", descricao: "Uma modalidade e acesso à musculação.", valor_mensal: "120.00", limite_modalidades: 1, ativo: true, created_at: now, updated_at: now },
      { nome: "Standard", descricao: "Duas modalidades e acesso à musculação.", valor_mensal: "220.00", limite_modalidades: 2, ativo: true, created_at: now, updated_at: now },
      { nome: "Premium", descricao: "Modalidades ilimitadas e benefícios adicionais.", valor_mensal: "350.00", limite_modalidades: null, ativo: true, created_at: now, updated_at: now },
    ]);
  },
  async down(q) { await q.bulkDelete("planos", { nome: ["Básico", "Standard", "Premium"] }, {}); },
};
