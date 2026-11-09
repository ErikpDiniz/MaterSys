require("./load-env");
function config(environment) {
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: environment === "test" ? process.env.DB_NAME_TEST : process.env.DB_NAME,
    host: environment === "production" ? (process.env.DB_HOST_PROD || process.env.DB_HOST) : process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: process.env.DB_DIALECT || "postgres",
    dialectOptions: ["true", "1"].includes(process.env.DB_SSL)
      ? { ssl: { require: true, rejectUnauthorized: true } } : {},
    logging: false,
    seederStorage: "sequelize",
  };
}
module.exports = { development: config("development"), test: config("test"), production: config("production") };
