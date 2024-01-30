// Importamos dependencias
const express = require("express");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();

/**
 * Obtiene todas las ligas.
 * 
 * @route GET /ligas
 * 
 * @returns {object} Todas las ligas.
 */
router.get("/", [auth, viewer], (req, res) => {
    const sqlSelect = "SELECT * FROM ligas";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

module.exports = router;
