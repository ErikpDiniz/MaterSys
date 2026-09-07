// src/routes/index.js — junta todas as rotas da aplicação
const { Router } = require("express");
const authRoutes = require("./authRoutes");
const router = Router();
router.use("/", authRoutes); // amanhã: router.use("/usuarios", usuarioRoutes)
module.exports = router;
