module.exports = (sequelize, DataTypes) => sequelize.define("Contrato", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  plano_id: { type: DataTypes.INTEGER, allowNull: false },
  data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  data_fim: { type: DataTypes.DATEONLY, allowNull: false },
  valor_mensal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "ATIVO",
    validate: { isIn: [["ATIVO", "CANCELADO", "ENCERRADO"]] } },
  data_assinatura: { type: DataTypes.DATEONLY, allowNull: true },
  observacoes: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
}, { tableName: "contratos", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });
