const { PORT } = require("./configs");
const { criarApp } = require("./app");
const modelos = require("./models");
async function iniciar() {
  try {
    for (const nome of ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]) {
      if (!process.env[nome]) throw new Error("Preencha " + nome + " no arquivo .env.");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres.");
    await modelos.sequelize.authenticate();
    const server = criarApp(modelos).listen(PORT, () => console.log("Backend em http://localhost:" + PORT));
    server.on("error", async () => {
      console.error("Não foi possível abrir a porta " + PORT + ". Confira se ela já está em uso.");
      await modelos.sequelize.close();
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(error.message.startsWith("Preencha ") || error.message.startsWith("Configure ") ? error.message : "Falha na conexão com o PostgreSQL. Confira o .env e se o banco está disponível.");
    await modelos.sequelize.close();
    process.exitCode = 1;
  }
}
iniciar();
