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

router.get("/", (req, res) => {
  // GET /emparejamientos
  // recibimos todos los emparejamientos
  const sqlSelect = "SELECT * FROM bracket ORDER BY id_liga ASC, id_temporada ADC, ronda ASC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/liga=:liga/temporada=:temporada", [auth, viewer], (req, res) => {
  // GET /liga/temporada
  // recibimos todos los emparejamientos que sean de una liga y temporada
  const liga = req.params.liga;
  const temporada = req.params.temporada;
  const sqlSelect = "SELECT * FROM bracket WHERE id_liga = ? AND id_temporada = ? ORDER BY ronda ASC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

// Se deben hacer los endpoints de edición y borrado de emparejamientos para el panel de admin.

module.exports = router;
