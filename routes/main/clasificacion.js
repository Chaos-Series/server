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
    const { query, params } = getSQL(req, "SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion FROM estadisticasequipos");
    returnQuery(query, res, params);
});


/**
 * Obtiene la clasificación de un equipo por su ID.
 * 
 * @route GET /clasificacion/id=:id
 * 
 * @returns {object} La clasificación de todos los equipos.
 */
router.get("/id=:id", (req, res) => {
    const { id } = req.params;
    returnQuery("SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion FROM estadisticasequipos WHERE id_equipo = ?", res, [id]);
});


/**
 * Obtiene la clasificación de un equipo con estadísticas.
 * 
 * @route GET /clasificacion
 * 
 * @returns {object} La clasificación del equipo con estadísticas.
*/
router.get("/detalles/id=:id", (req, res) => {
    const { query, params } = getSQL(req, "SELECT id_equipo, id_liga, id_temporada, victorias, derrotas, puntuacion, kda, oro, minions, barones, dragones, almas, torres, campeones_jugados, campeones_baneados FROM estadisticasequipos ORDER BY puntuacion DESC, id_equipo DESC");
    returnQuery(query, res, params);
});


function getSQL(req, baseQuery) {
    const { id_liga, id_temporada } = req.query;
    let query = baseQuery;
    let params = [];

    if (id_liga && id_temporada) {
        query += " WHERE id_liga = ? AND id_temporada = ?";
        params = [id_liga, id_temporada];
    }

    query += " ORDER BY puntuacion DESC, id_equipo DESC";

    return { query, params };
}


// Exportamos el router
module.exports = router;