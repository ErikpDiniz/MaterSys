const { Sequelize, DataTypes } = require("sequelize");
const configs = require("../configs/database");

function criarModelos(sequelize) {
  const Usuario = require("./usuario")(sequelize, DataTypes);
  const Plano = require("./plano")(sequelize, DataTypes);
  const Contrato = require("./contrato")(sequelize, DataTypes);
  Usuario.hasMany(Contrato, { foreignKey: "usuario_id", as: "contratos" });
  Contrato.belongsTo(Usuario, { foreignKey: "usuario_id", as: "aluno" });
  Plano.hasMany(Contrato, { foreignKey: "plano_id", as: "contratos" });
  Contrato.belongsTo(Plano, { foreignKey: "plano_id", as: "plano" });
  return { sequelize, Usuario, Plano, Contrato };
}

const config = configs[process.env.NODE_ENV || "development"];
if (!config) throw new Error("NODE_ENV inválido");
module.exports = { ...criarModelos(new Sequelize(config)), criarModelos };
