// Importamos dependencias
const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser")
const cors = require("cors");

// Set del servidor
const app = express();
const port = 3001;

// Set de rate limit
const limiter = rateLimit({
    windowMs: 60000, // 1 minuto cooldown
    max: 210, // requests permitidas
    message: {
        status: 429,
        error: "Has superado las peticiones al servidor. Vuelve a intentarlo en 1 minuto.",
    },
});

const allowedOrigins = [
    "https://chaosseries.com",
    "https://panel.chaosseries.com",
    "http://localhost:5173",
]

// Importamos middlewares
app.use(express.json());
app.use(limiter); // app.use("/api/", limiter);
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        
        callback(new Error("Acceso denegado."));
    },
}));
app.options('*', cors()) // habilitar Preflight de CORS
app.disable('x-powered-by'); // deshabilitar header X-Powered-By por seguridad

// Set de rutas
const routes = [
    { path: "/auth", router: require("./routes/auth") },
    { path: "/usuarios", router: require("./routes/main/usuarios") },
    { path: "/temporadas", router: require("./routes/main/temporadas") },
    { path: "/riot", router: require("./routes/main/riot") },
    { path: "/partidos", router: require("./routes/main/partidos") },
    { path: "/misc", router: require("./routes/main/misc") },
    { path: "/ligas", router: require("./routes/main/ligas") },
    { path: "/equipos", router: require("./routes/main/equipos") },
    { path: "/cuentas", router: require("./routes/main/cuentas") },
    { path: "/emparejamientos", router: require("./routes/main/emparejamientos") },
    { path: "/clasificacion", router: require("./routes/main/clasificacion") },

    //v2
    { path: "/v2/partidos", router: require("./routes/v2/partidos") },
];

routes.forEach(route => {
    app.use(route.path, route.router);
});

// Iniciamos servidor
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
