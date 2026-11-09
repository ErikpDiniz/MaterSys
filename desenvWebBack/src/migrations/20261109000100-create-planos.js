module.exports = {
  async up(q, S) {
    await q.createTable("planos", {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: S.STRING(100), allowNull: false, unique: true },
      descricao: { type: S.TEXT, allowNull: false, defaultValue: "" },
      valor_mensal: { type: S.DECIMAL(10, 2), allowNull: false },
      limite_modalidades: { type: S.INTEGER, allowNull: true },
      ativo: { type: S.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    });
    await q.sequelize.query("ALTER TABLE planos ADD CONSTRAINT planos_valores_check CHECK (valor_mensal >= 0 AND (limite_modalidades IS NULL OR limite_modalidades > 0))");
  },
  async down(q) { await q.dropTable("planos"); },
};
