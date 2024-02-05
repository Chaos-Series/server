// Importamos dependencias
const express = require("express");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();

// *************************
// Set de todos los endpoints
// *************************

/**
 * Obtiene todas las temporadas.
 * 
 * @route GET /temporadas
 * 
 * @returns {object} Todas las temporadas.
 */
router.get("/", [auth, viewer], (req, res) => {
    // /temporadas
    //buscamos todas las temporadas
    const sqlSelect = "SELECT * FROM temporadas";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

// Exportamos el router
module.exports = router;
