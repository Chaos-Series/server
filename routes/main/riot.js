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

/**
 * Recibe la info de riot y la envía al webhook de discord.
 * 
 * @route POST /riot
 * 
 * @returns {null} 
 */
router.post("/", async (req, res) => {
    hook.send("recibida info de riot. <@286402429258301440>");
});

/**
 * Actualiza la información de un partido.
 * 
 * @route POST /riot/inhouses
 * 
 * @returns {object} La respuesta de la base de datos. 
 */
router.post("/inhouses", async (req, res) => {
    //hook.send("recibida info de riot. <@286402429258301440>");
    console.log(req.body.shortCode)
    
    const sql =
        "UPDATE partidos SET match_info = ?, match_id = ?, progreso = 1 WHERE codigo_torneo = ?";
    db.query(sql, [JSON.stringify(req.body), req.body.gameId, req.body.shortCode], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

// Exportamos el router
module.exports = router;
