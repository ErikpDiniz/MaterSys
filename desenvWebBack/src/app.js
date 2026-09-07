const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const app = express();
app.use(cors()); // responde os headers Access-Control-Allow-Origin
app.use(express.json()); // transforma o body JSON em req.body
app.use(routes);
module.exports = app;
