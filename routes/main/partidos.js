// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const db = require("../../middleware/db");

//Importamos utils
const { getPlayerStats } = require("../../utils/getPlayerStats");
const { returnMatch } = require("../../utils/returnMatch");

// Set del router
const router = express.Router();
const RIOT_API = process.env.RIOT_API;

/**
 * Obtiene todos los partidos ordenados por progreso y fecha, con la informacion de los equipos implicados.
 * 
 * @route GET /partidos
 * 
 * @returns {object} Todos los partidos ordenados por progreso y fecha y con la informacion de los equipos implicados.
 */
router.get("/", (req, res) => {
  returnMatch(res);
});

/**
 * Obtiene todos los partidos ordenados por progreso y fecha.
 * 
 * @route GET /partidos/panel
 * 
 * @returns {object} Todos los partidos ordenados por progreso y fecha.
 */
router.get("/panel", (req, res) => {
  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 0 ORDER BY progreso ASC, fecha ASC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Obtiene todas las inhouses ordenadas por progreso y fecha.
 * 
 * @route GET /partidos/inhouses
 * 
 * @returns {object} Todas las inhouses ordenadas por progreso y fecha.
 */
router.get("/inhouses", [auth, viewer], (req, res) => {
  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 1 ORDER BY progreso ASC, fecha ASC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Obtiene los datos de un partido según su ID.
 * 
 * @route GET /partidos/id=:id
 *
 * @param {number} id_partido - El ID del partido.
 * @returns {object} El partido basado en el id.
 */
router.get("/id=:id", [auth, viewer], (req, res) => {
  const { id } = req.params;
  const sqlSelect = "SELECT * FROM partidos WHERE id_partido = ? AND tipo = 0";
  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Obtiene los datos de una inhouse según su ID.
 * 
 * @route GET /partidos/inhouses/id=:id
 *
 * @param {number} id_partido - El ID del partido.
 * @returns {object} La inhouse basada en el id.
 */
router.get("/inhouses/id=:id", [auth, viewer], (req, res) => {
  const id = req.params.id;
  const sqlSelect = "SELECT * FROM partidos WHERE id_partido = ? AND tipo = 1";
  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

/**
 * Obtiene las estadísticas de un partido sin estadísticas y las actualiza en la base de datos.
 * 
 * @route PUT /partidos/estadisticas
 * 
 * @returns {null} 
 */
router.put("/estadisticas", (req, res) => {
  const sqlSelect = "SELECT match_id FROM partidos WHERE tipo = 0 AND estadisticas_recogidas = 0 AND match_id IS NOT null limit 10";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      getPlayerStats(res, result);
    }
  });
º});

/**
 * Obtiene las estadísticas de una inhouse sin estadísticas y las actualiza en la base de datos.
 * 
 * @route PUT /partidos/inhouses/estadisticas
 * 
 * @returns {null} 
 */
router.put("/inhouses/estadisticas", (req, res) => {
  const sqlSelect = "SELECT match_id FROM partidos WHERE tipo = 1 AND estadisticas_recogidas = 0 AND match_id IS NOT null limit 10";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      getPlayerStats(res, result);
    }
  });
});


/**
 * Crea una inhouse
 * 
 * @route POST /partidos/inhouses
 * 
 * @param {string} fecha - La fecha del partido.
 * @returns {object} La respuesta de la base de datos.
 */
router.post("/inhouses", [auth, admin], async (req, res) => {
  const { fecha } = req.body;
  axios
    .post("https://americas.api.riotgames.com/lol/tournament/v5/codes?tournamentId=7188490&count=1&api_key=" + RIOT_API, {
      mapType: "SUMMONERS_RIFT",
      pickType: "TOURNAMENT_DRAFT",
      spectatorType: "ALL",
      teamSize: 5,
    })
    .then((response) => {
      const sql = "INSERT INTO partidos (tipo, fecha, codigo_torneo) VALUES (?, ?, ?)";
      db.query(sql, [tipo, fecha, response.data], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          res.send({ status: 200, success: true, result: result });
        }
      });
    });
});


/**
 * Crea un partido
 * 
 * @route POST /partidos
 * 
 * @param {string} fecha - La fecha del partido.
 * @returns {object} La respuesta de la base de datos.
 */
router.post("/", [auth, admin], async (req, res) => {
  const { fecha, id_liga, id_temporada } = req.body;
  axios
    .post("https://americas.api.riotgames.com/lol/tournament/v5/codes?tournamentId=7188490&count=1&api_key=" + RIOT_API, {
      mapType: "SUMMONERS_RIFT",
      pickType: "TOURNAMENT_DRAFT",
      spectatorType: "ALL",
      teamSize: 5,
    })
    .then((response) => {
      const sql = "INSERT INTO partidos (id_liga, id_temporada, tipo, fecha, codigo_torneo) VALUES (?, ?, 0, ?, ?)";
      db.query(sql, [id_liga, id_temporada, fecha, response.data], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          res.send({ status: 200, success: true, result: result });
        }
      });
    });
});


/**
 * Inscripción de jugador en una inhouse
 * 
 * @route PUT /partidos/inhouses
 * 
 * @param {number} id_inhouse - El ID de la inhouse.
 * @param {number} id_usuario - El ID del usuario.
 * @param {number} posicion - La posición del usuario.
 * @param {number} side - El lado del usuario.
 * @returns {object} La respuesta de la base de datos.
 */
router.put("/inhouses", [auth, self], async (req, res) => {
  const { id_inhouse, id_usuario, posicion, side } = req.body;

  if (side !== 1 && side !== 2) return res.send({ status: 400, success: false, reason: "Problema con la información recibida." });

  const sqlSelect = "SELECT jugadores_blue, jugadores_red FROM partidos WHERE id_partido = ?";
  db.query(sqlSelect, [id_inhouse], (err, result) => {
    
    if (err) return res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });

    const jugadores = {
      1: JSON.parse(result[0]["jugadores_blue"]),
      2: JSON.parse(result[0]["jugadores_red"])
    };

    const existe = jugadores[1].some(jugador => jugador.id === id_usuario) || jugadores[2].some(jugador => jugador.id === id_usuario);

    if (existe) return res.send({ status: 200, success: false, result: "El usuario ya existe." });

    const sqlUpdate = `UPDATE partidos SET jugadores_${side === 1 ? 'blue' : 'red'} = ? WHERE id_partido = ?`;
    jugadores[side][posicion]["id"] = id_usuario;

    db.query(sqlUpdate, [JSON.stringify(jugadores[side]), id_inhouse], (err, result) => {
      if (err) {
        return res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
      }

      res.send({ status: 200, success: true, result: result });
    });
  });
});


/**
 * Modificación de jugador en un partido
 * 
 * @route PUT /partidos
 * 
 * @param {number} id_usuario - El ID del usuario.
 * @param {number} columna - La columna a modificar.
 * @param {number} valor - La posición del usuario.
 * @returns {object} La respuesta de la base de datos.
 */
router.put("/", [auth, admin], async (req, res) => {
  const { id_usuario, columna, valor } = req.body;

  const sql = "UPDATE usuarios SET `" + columna + "` = ? WHERE id_usuario = ?";
  db.query(sql, [valor, id_usuario], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Borrado de un partido
 * 
 * @route DELETE /partidos
 * 
 * @param {number} id - El ID del partido.
 * @returns {object} La respuesta de la base de datos.
 */
router.delete("/", [auth, admin], async (req, res) => {
  const id = req.body.id;

  const sqlDeleteLogs = "DELETE FROM logs WHERE id_usuario = ?";
  const sqlDeleteSesiones = "DELETE FROM sesiones WHERE id_usuario = ?";
  const sqlDeleteCuentas = "DELETE FROM cuentas_lol WHERE id_usuario = ?";
  const sqlDeleteUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";

  try {
    db.query(sqlDeleteLogs, [id]);
    db.query(sqlDeleteSesiones, [id]);
    db.query(sqlDeleteCuentas, [id]);
    db.query(sqlDeleteUsuario, [id]);

    res.send({ status: 200, success: true });
  } catch (err) {
    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
  }
});

module.exports = router;
