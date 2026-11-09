module.exports = {
  async up(q, S) {
    await q.createTable("usuarios", {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: S.STRING(255), allowNull: false },
      email: { type: S.STRING(255), allowNull: false, unique: true },
      senha: { type: S.STRING(255), allowNull: false },
      perfil: { type: S.STRING(20), allowNull: false, defaultValue: "ALUNO" },
      ativo: { type: S.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: S.DATE, allowNull: false },
      updated_at: { type: S.DATE, allowNull: false },
    });
    await q.sequelize.query("ALTER TABLE usuarios ADD CONSTRAINT usuarios_perfil_check CHECK (perfil IN ('ADMIN', 'TREINADOR', 'ALUNO'))");
  },
  async down(q) { await q.dropTable("usuarios"); },
};
