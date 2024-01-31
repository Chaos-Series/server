// Importamos dependencias
const express = require("express");

const { returnQuery } = require("../../utils/returnQuery");

// Set del router
const router = express.Router();

// *************************
// Set de todos los endpoints
// *************************

/**
 * Obtiene la clasificación de todos los equipos.
 * 
 * @route GET /clasificacion
 * 
 * @returns {object} La clasificación de todos los equipos.
 */
router.get("/", (req, res) => {
    const { id_liga, id_temporada } = req.query;

    let query = "SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion FROM estadisticasequipos";
    let params = [];

    if (id_liga && id_temporada) {
        query += " WHERE id_liga = ? AND id_temporada = ?";
        params = [id_liga, id_temporada];
    }

    query += " ORDER BY puntuacion DESC, id_equipo DESC";

    returnQuery(query, res, params);
});


/**
 * Obtiene la clasificación de todos los equipos con estadísticas.
 * 
 * @route GET /clasificacion
 * 
 * @returns {object} La clasificación de todos los equipos con estadísticas.
*/
router.get("/detalles", (req, res) => {
    returnQuery("SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion, kda, oro, minions, barones, dragones, almas, torres, campeones_jugados, campeones_baneados FROM estadisticasequipos ORDER BY puntuacion DESC, id_equipo DESC", res);
});


// Exportamos el router
module.exports = router;