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

// Exportamos el router
module.exports = router;
