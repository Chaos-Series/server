// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const db = require("../../middleware/db");

//Importtamos utils
const returnPlayer = require("../../utils/returnPlayer");
const { getPlayerStats } = require("../../utils/getPlayerStats");

// Set del router
const router = express.Router();

const RIOT_API = "RGAPI-48c2e07c-b903-4720-be64-d3ba9a416206";

// *************************
// Set up the route handlers
// *************************

router.get("/", (req, res) => {
  // /usuarios
  // recibimos todos los usuarios

  const sqlSelect = "SELECT * FROM partidos WHERE tipo = 0";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/inhouses", [auth, viewer], (req, res) => {
  // /usuarios
  // recibimos todos los usuarios

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
  // /usuarios
  // recibimos todos los usuarios
  const id = req.params.id;

  const sqlSelect = "SELECT * FROM partidos WHERE id_partido = ? AND tipo = 1 ORDER BY progreso ASC, fecha ASC";
  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/inhouses/estadisticas", (req, res) => {
  const sqlSelect = "SELECT match_id FROM partidos WHERE tipo = 1 AND estadisticas_recogidas = 0 AND match_id IS NOT null AND match_id = 6695186270";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      getPlayerStats(res, result);
    }
  });
});

router.get("/id=:id", [auth, viewer], (req, res) => {
  // /usuarios/id=:id
  // recibimos usuario por id
  const id = req.params.id;

  returnPlayer(id, res);
});

router.post("/inhouses", [auth, admin], async (req, res) => {
  // /crearusuario
  // crearmos un usuario
  fecha = req.body.fecha;
  //

  axios
    .post("https://americas.api.riotgames.com/lol/tournament/v5/codes?tournamentId=7188490&count=1&api_key=" + RIOT_API, {
      mapType: "SUMMONERS_RIFT",
      pickType: "TOURNAMENT_DRAFT",
      spectatorType: "ALL",
      teamSize: 5,
    })
    .then((response) => {
      //console.log(response.data)
      const sql = "INSERT INTO partidos (tipo, fecha, codigo_torneo) VALUES (1, ?, ?)";
      db.query(sql, [fecha, response.data], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          res.send({ status: 200, success: true, result: result });
        }
      });
    });
});

router.put("/inhouses", [auth, self], async (req, res) => {
  // /partidos/inhouses
  // inscripcion de jugador en inhouse
  id_inhouse = req.body.id_inhouse;
  id_usuario = req.body.id_usuario;
  posicion = req.body.posicion;
  side = req.body.side;
  //
  let existe = false;

  let sqlSelect = "";
  if (side == 1 || side == 2) {
    sqlSelect = "SELECT jugadores_blue, jugadores_red FROM partidos WHERE id_partido = ?";
  } else {
    res.send({ status: 400, success: false, reason: "Problema con la información recibida.", error: err });
  }
  db.query(sqlSelect, [id_inhouse], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      if (side == 1 || side == 2) {
        for (let i = 0; i < JSON.parse(result[0]["jugadores_blue"]).length; i++) {
          if (JSON.parse(result[0]["jugadores_blue"])[i].id === id_usuario) {
            existe = true;
            break;
          }
        }
        for (let i = 0; i < JSON.parse(result[0]["jugadores_red"]).length; i++) {
          if (JSON.parse(result[0]["jugadores_red"])[i].id === id_usuario) {
            existe = true;
            break;
          }
        }
        if (existe) {
          res.send({ status: 200, success: false, result: "El usuario ya existe." });
        } else {
          let sqlUpdate = "";
          if (side == 1) {
            sqlUpdate = "UPDATE partidos SET jugadores_blue = ? WHERE id_partido = ?;";
            JSON.parse(result[0]["jugadores_blue"])[posicion]["id"] = id_usuario;
            let JSONFinalizado = JSON.parse(result[0]["jugadores_blue"]);
            JSONFinalizado[posicion]["id"] = id_usuario;
            db.query(sqlUpdate, [JSON.stringify(JSONFinalizado), id_inhouse], (err, result) => {
              if (err) {
                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
              } else {
                res.send({ status: 200, success: true, result: result });
              }
            });
          } else if (side == 2) {
            sqlUpdate = "UPDATE partidos SET jugadores_red = ? WHERE id_partido = ?;";
            JSON.parse(result[0]["jugadores_red"])[posicion]["id"] = id_usuario;
            let JSONFinalizado = JSON.parse(result[0]["jugadores_red"]);
            JSONFinalizado[posicion]["id"] = id_usuario;
            db.query(sqlUpdate, [JSON.stringify(JSONFinalizado), id_inhouse], (err, result) => {
              if (err) {
                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
              } else {
                res.send({ status: 200, success: true, result: result });
              }
            });
          } else {
            res.send({ status: 400, success: false, reason: "Problema con la información recibida.", error: err });
          }
        }
      } else {
        res.send({ status: 400, success: false, reason: "Problema con la información recibida.", error: err });
      }
    }
  });
});

router.put("/", [auth, admin], async (req, res) => {
  // /modificarusuario
  // modificamos un usuario
  id_usuario = req.body.id_usuario;
  columna = req.body.columna;
  valor = req.body.valor;

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
  // /borrarusuario
  // eliminamos un usuario a partir de su id
  id = req.body.id;

  const sqlDeleteLogs = "DELETE FROM logs WHERE id_usuario = ?";
  const sqlDeleteSesiones = "DELETE FROM sesiones WHERE id_usuario = ?";
  const sqlDeleteCuentas = "DELETE FROM cuentas_lol WHERE id_usuario = ?";
  const sqlDeleteUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";
  db.query(sqlDeleteLogs, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      db.query(sqlDeleteSesiones, [id], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          db.query(sqlDeleteCuentas, [id], (err, result) => {
            if (err) {
              res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
            } else {
              db.query(sqlDeleteUsuario, [id], (err, result) => {
                if (err) {
                  res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
                } else {
                  res.send({ status: 200, success: true, result: result });
                }
              });
            }
          });
        }
      });
    }
  });
});

// Exportamos el router
module.exports = router;
