const { Router } = require("express");
module.exports = (auth) => {
  const router = Router();
  router.post("/login", require("../controllers/authController")(auth).login);
  return router;
};
