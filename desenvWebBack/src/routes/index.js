const { Router } = require("express");
module.exports = (modelos) => {
  const router = Router();
  const auth = require("../services/authService")(modelos);
  const { autenticar, administrador } = require("../middlewares/autenticacao")(auth);
  const servicos = require("../services/cadastroService")(modelos);
  router.use(require("./authRoutes")(auth));
  router.use(autenticar);
  router.get("/auth/me", (req, res) => res.json({ usuario: req.usuario }));

  for (const nome of ["usuarios", "planos", "contratos"]) {
    const recurso = Router();
    const servico = servicos[nome];
    if (nome === "usuarios") recurso.use(administrador);
    recurso.get("/", async (req, res) => res.json(await servico.listar(req.usuario)));
    recurso.get("/:id", async (req, res) => res.json(await servico.obter(req.params.id, req.usuario)));
    recurso.post("/", administrador, async (req, res) => res.status(201).json(await servico.criar(req.body || {}, req.usuario)));
    recurso.put("/:id", administrador, async (req, res) => res.json(await servico.atualizar(req.params.id, req.body || {}, req.usuario)));
    recurso.delete("/:id", administrador, async (req, res) => {
      await servico.excluir(req.params.id, req.usuario);
      res.status(204).end();
    });
    router.use("/" + nome, recurso);
  }
  return router;
};
