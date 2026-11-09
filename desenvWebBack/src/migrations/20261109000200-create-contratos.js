module.exports = {
  async up(q, S) {
    await q.createTable("contratos", {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: S.INTEGER, allowNull: false, references: { model: "usuarios", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      plano_id: { type: S.INTEGER, allowNull: false, references: { model: "planos", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      data_inicio: { type: S.DATEONLY, allowNull: false },
      data_fim: { type: S.DATEONLY, allowNull: false },
      valor_mensal: { type: S.DECIMAL(10, 2), allowNull: false },
      status: { type: S.STRING(20), allowNull: false, defaultValue: "ATIVO" },
      data_assinatura: { type: S.DATEONLY, allowNull: true },
      observacoes: { type: S.TEXT, allowNull: false, defaultValue: "" },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    });
    await q.addIndex("contratos", ["usuario_id"]);
    await q.addIndex("contratos", ["plano_id"]);
    await q.sequelize.query("ALTER TABLE contratos ADD CONSTRAINT contratos_valores_check CHECK (valor_mensal >= 0 AND data_fim >= data_inicio AND status IN ('ATIVO', 'CANCELADO', 'ENCERRADO'))");
  },
  async down(q) { await q.dropTable("contratos"); },
};
