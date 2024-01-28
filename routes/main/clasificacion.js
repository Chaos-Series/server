// Importamos dependencias
const express = require("express");

// Importamos middlewares
const { Webhook } = require("discord-webhook-node");
const hook = new Webhook("https://discord.com/api/webhooks/1141434977733582900/XLZWqEsQti3PwOhxsFDXHKxU_owbh3L11iUcn0cHbl5yIlSjlUvBmu598HivoOOKdSi2");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();

// *************************
// Set de todos los endpoints
// *************************

router.get("/", (req, res) => {
    // /clasificacion
    // recibimos toda la clasificacion

    const sqlSelect = "SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion, kda, oro, minions, barones, dragones, almas, torres, campeones_jugados, campeones_baneados FROM estadisticasequipos ORDER BY puntuacion DESC, id_equipo DESC";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result });
        }
    });
});

// Exportamos el router
module.exports = router;
