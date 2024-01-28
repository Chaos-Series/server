// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const db = require("../../middleware/db");

//Importamos utils
const returnPlayer = require("../../utils/returnPlayer");
const { getPlayerStats } = require("../../utils/getPlayerStats");

// Set del router
const router = express.Router();
const RIOT_API = process.env.RIOT_API;

router.get("/", (req, res) => {
  // GET /partidos
  // recibimos todos los partidos
  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 0";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/partidos", [auth, viewer], (req, res) => {
  // GET /partidos/partidos
  // recibimos todos los partidos
  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 0 ORDER BY fecha";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/inhouses", [auth, viewer], (req, res) => {
  // GET /partidos/inhouses
  // recibimos todas las inhouses ordenadas por progreso y fecha
  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 1 ORDER BY progreso ASC, fecha ASC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/inhouses/id=:id", [auth, viewer], (req, res) => {
  // GET /partidos/inhouses/id=:id
  // recibimos todas las inhouses ordenadas por progreso y fecha basadas en el id
  const id = req.params.id;
  const tipo = req.params.tipo;
  const sqlSelect = "SELECT * FROM partidos WHERE id_partido = ? AND tipo = ? ORDER BY progreso ASC, fecha ASC";
  db.query(sqlSelect, [id, tipo], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/inhouses/estadisticas", (req, res) => {
  // PUT /partidos/inhouses/estadisticas
  const sqlSelect = "SELECT match_id FROM partidos WHERE tipo = 1 AND estadisticas_recogidas = 0 AND match_id IS NOT null limit 1";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      getPlayerStats(res, result);
    }
  });
});

router.get("/id=:id", [auth, viewer], (req, res) => {
  // GET /partidos/id=:id
  // recibimos usuario por id
  const id = req.params.id;
  returnPlayer(id, res);
});

router.post("/inhouses", [auth, admin], async (req, res) => {
  // POST /partidos/inhouses
  // creamos una inhouse o un partido
  const { fecha, tipo } = req.body;
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

router.put("/inhouses", [auth, self], async (req, res) => {
  // PUT /partidos/inhouses
  // inscripcion de jugador en inhouse
  const { id_inhouse, id_usuario, posicion, side } = req.body;
  let existe = false;

  if (side !== 1 && side !== 2) {
    res.send({ status: 400, success: false, reason: "Problema con la información recibida." });
    return;
  }

  const sqlSelect = "SELECT jugadores_blue, jugadores_red FROM partidos WHERE id_partido = ?";
  db.query(sqlSelect, [id_inhouse], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
      return;
    }

    const jugadoresBlue = JSON.parse(result[0]["jugadores_blue"]);
    const jugadoresRed = JSON.parse(result[0]["jugadores_red"]);

    for (let i = 0; i < jugadoresBlue.length; i++) {
      if (jugadoresBlue[i].id === id_usuario) {
        existe = true;
        break;
      }
    }

    if (!existe) {
      for (let i = 0; i < jugadoresRed.length; i++) {
        if (jugadoresRed[i].id === id_usuario) {
          existe = true;
          break;
        }
      }
    }

    if (existe) {
      res.send({ status: 200, success: false, result: "El usuario ya existe." });
    } else {
      let sqlUpdate = "";
      let JSONFinalizado = [];

      if (side === 1) {
        sqlUpdate = "UPDATE partidos SET jugadores_blue = ? WHERE id_partido = ?";
        jugadoresBlue[posicion]["id"] = id_usuario;
        JSONFinalizado = jugadoresBlue;
      } else if (side === 2) {
        sqlUpdate = "UPDATE partidos SET jugadores_red = ? WHERE id_partido = ?";
        jugadoresRed[posicion]["id"] = id_usuario;
        JSONFinalizado = jugadoresRed;
      } else {
        res.send({ status: 400, success: false, reason: "Problema con la información recibida." });
        return;
      }

      db.query(sqlUpdate, [JSON.stringify(JSONFinalizado), id_inhouse], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          res.send({ status: 200, success: true, result: result });
        }
      });
    }
  });
});

router.put("/", [auth, admin], async (req, res) => {
  // PUT /partidos
  // modificamos un partido
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

router.delete("/", [auth, admin], async (req, res) => {
  // DELETE /partidos
  // borramos un partido
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
