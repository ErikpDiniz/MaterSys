const express = require("express");
const cors = require("cors");
const { FRONTEND_URL } = require("./configs");
function criarApp(modelos = require("./models")) {
  const app = express();
  app.use(cors({ origin: FRONTEND_URL }));
  app.use(express.json({ limit: "100kb" }));
  app.get("/health", async (req, res, next) => {
    try { await modelos.sequelize.authenticate(); res.json({ status: "ok", banco: "conectado" }); }
    catch (error) { next(error); }
  });
  app.use(require("./routes")(modelos));
  app.use((req, res) => res.status(404).json({ mensagem: "Rota não encontrada." }));
  app.use((error, req, res, next) => {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).json({ mensagem: "Já existe um registro com esses dados." });
    if ((error.name === "SequelizeForeignKeyConstraintError" || ["23503", "23001"].includes(error.original?.code))) return res.status(409).json({ mensagem: "Registro vinculado a outros dados. Desative ou encerre em vez de excluir." });
    if (error.name === "SequelizeValidationError") return res.status(400).json({ mensagem: "Verifique os campos informados." });
    if (error.type === "entity.parse.failed") return res.status(400).json({ mensagem: "JSON inválido." });
    if (error.status && error.status < 500) return res.status(error.status).json({ mensagem: error.message });
    console.error("Falha na requisição:", error.name);
    res.status(500).json({ mensagem: "Não foi possível concluir a operação. Verifique o servidor e o banco." });
  });
  return app;
}
module.exports = { criarApp };
