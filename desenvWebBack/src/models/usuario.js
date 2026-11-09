module.exports = (sequelize, DataTypes) => sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  senha: { type: DataTypes.STRING(255), allowNull: false },
  perfil: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "ALUNO",
    validate: { isIn: [["ADMIN", "TREINADOR", "ALUNO"]] } },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: "usuarios", timestamps: true, createdAt: "created_at", updatedAt: "updated_at",
  defaultScope: { attributes: { exclude: ["senha"] } },
  scopes: { comSenha: { attributes: { include: ["senha"] } } },
});
