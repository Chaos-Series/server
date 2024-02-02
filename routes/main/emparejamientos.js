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


/**
 * Obtiene todos los emparejamientos ordenados por liga, temporada, y ronda.
 * 
 * @route GET /emparejamientos
 * 
 * @returns {object} Todos los emparejamientos ordenados por liga, temporada, y ronda.
 */
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


/**
 * Obtiene todos los emparejamientos de una liga y temporada.
 * 
 * @route GET /emparejamientos/liga=:liga/temporada=:temporada
 * 
 * @param {string} liga - El ID de la liga.
 * @param {string} temporada - El ID de la temporada.
 * @returns {object} Todos los emparejamientos de una liga y temporada.
 */
router.get("/liga=:liga/temporada=:temporada", [auth, viewer], (req, res) => {
  const { liga, temporada } = req.params;
  const sqlSelect = "SELECT * FROM bracket WHERE id_liga = ? AND id_temporada = ? ORDER BY ronda ASC";
  db.query(sqlSelect, [liga, temporada], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Edita un emparejamiento.
 * 
 * @route PUT /emparejamientos/:id
 * 
 * @param {string} id - El ID del emparejamiento.
 * @returns {object} El emparejamiento editado.
 */
router.put("/:id", [auth, admin], (req, res) => {
  const { id } = req.params;
  const { ronda, siguiente, victorias } = req.body;
  const sqlUpdate = "UPDATE bracket SET ronda = ?, siguiente = ?, victorias = ? WHERE id_bracket = ?";
  db.query(sqlUpdate, [ronda, siguiente, victorias, id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});


/**
 * Borra un emparejamiento.
 * 
 * @route DELETE /emparejamientos/:id
 * 
 * @param {string} id - El ID del emparejamiento.
 * @returns {object} El emparejamiento borrado.
 */
router.delete("/:id", [auth, admin], (req, res) => {
  const { id } = req.params;
  const sqlDelete = "DELETE FROM bracket WHERE id_bracket = ?";
  db.query(sqlDelete, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});



module.exports = router;
