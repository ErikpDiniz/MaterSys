module.exports = (sequelize, DataTypes) => sequelize.define("Plano", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descricao: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  valor_mensal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  limite_modalidades: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1 } },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "planos", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });
