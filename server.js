// Importamos dependencias
const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser")
const cors = require("cors");

// Set del servidor
const app = express();
const port = 3000;

// Set de rate limit
const limiter = rateLimit({
    windowMs: 60000, // 1 minuto cooldown
    max: 210, // requests permitidas
    message: {
        status: 429,
        error: "Has superado las peticiones al servidor. Vuelve a intentarlo en 1 minuto.",
    },
});

// Importamos middlewares
app.use(express.json());
app.use(limiter); // app.use("/api/", limiter);
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

// Importamos rutas
const authRouter = require("./routes/auth");
const usuariosRouter = require("./routes/main/usuarios");
const temporadasRouter = require("./routes/main/temporadas");
const riotRouter = require("./routes/main/riot");
const partidosRouter = require("./routes/main/partidos")
const miscRouter = require("./routes/main/misc");
const ligasRouter = require("./routes/main/ligas");
const equiposRouter = require("./routes/main/equipos")
const cuentasRouter = require("./routes/main/cuentas");

// Seteamos rutas
app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);
app.use("/temporadas", temporadasRouter);
app.use("/riot", riotRouter);
app.use("/partidos", partidosRouter)
app.use("/misc", miscRouter);
app.use("/ligas", ligasRouter);
app.use("/equipos", equiposRouter);
app.use("/cuentas", cuentasRouter);

// Iniciamos servidor
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
