// Importamos dependencias
const express = require("express");
const multer = require("multer");
const path = require("path");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Creamos el storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Set del router
const router = express.Router();


/**
 * Obtiene todos los equipos.
 * 
 * @route GET /equipos
 * 
 * @returns {object} Todos los equipos.
 */
router.get("/", (req, res) => {
    const sqlSelect = "SELECT * FROM equipos";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result });
        }
    });
});


/**
 * Obtiene un equipo por id.
 * 
 * @route GET /equipos/id=:id
 * 
 * @param {string} id - El ID del equipo.
 * @returns {object} El equipo basado en el id.
 */
router.get("/id=:id", (req, res) => {
    const id = req.params.id;
    const sqlSelect =
        "SELECT * FROM equipos LEFT JOIN ligas ON equipos.id_liga = ligas.id_liga LEFT JOIN temporadas ON equipos.id_temporada = temporadas.id_temporada WHERE equipos.id_equipo = ?";
    db.query(sqlSelect, [id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result });
        }
    });
});


/**
 * Obtiene un equipo por nombre.
 * 
 * @route GET /equipos/nombre=:nombre
 * 
 * @param {string} nombre - El nombre del equipo.
 * @returns {object} El equipo basado en el nombre.
 */
router.get("/nombre=:nombre", (req, res) => {
    const nombre = req.params.nombre;
    const sqlSelect =
        "SELECT * FROM equipos LEFT JOIN ligas ON equipos.id_liga = ligas.id_liga LEFT JOIN temporadas ON equipos.id_temporada = temporadas.id_temporada WHERE equipos.nombre_equipo = ?";
    db.query(sqlSelect, [nombre], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Obtiene todos los usuarios dentro de un equipo a partir de su ID.
 * 
 * @route GET /equipos/usuarios/id=:id
 * 
 * @param {string} id - El ID del equipo.
 * @returns {object} Todos los usuarios dentro de un equipo a partir de su ID.
 */
router.get("/usuarios/id=:id", (req, res) => {
    const id = req.params.id;
    const sqlSelect = "SELECT id_usuario, id_equipo, id_discord, nombre_usuario, apellido_usuario, nick_usuario, edad, rol, icono, usuario_activado, circuitotormenta, twitter, discord FROM usuarios WHERE id_equipo = ?";
    db.query(sqlSelect, [id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Crea un equipo.
 * 
 * @route POST /equipos
 * 
 * @param {string} nombre - El nombre del equipo.
 * @param {string} acronimo - El acrónimo del equipo.
 * @param {string} imagenEquipo - La imagen del equipo.
 * @returns {object} El equipo creado.
 */
router.post("/", [auth, admin], upload.single("imagenEquipo"), async (req, res) => {
    const image = req.file;
    const { nombre, acronimo } = req.body;
    const sql = "INSERT INTO `equipos` (`nombre_equipo`, `logo_equipo`, `acronimo_equipo`) VALUES (?, ?, ?)";
    db.query(sql, [nombre, image.filename, acronimo], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Modifica un equipo.
 * 
 * @route PUT /equipos
 * 
 * @param {string} id - El ID del equipo.
 * @param {string} columna - La columna a modificar.
 * @param {string} valor - El valor a modificar.
 * @returns {object} El equipo modificado.
 */
router.put("/", [auth, admin], async (req, res) => {
    const { id, columna, valor } = req.body;
    const sql = "UPDATE equipos SET `" + columna + "` = ? WHERE id_equipo = ?";
    db.query(sql, [valor, id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Elimina un equipo.
 * 
 * @route DELETE /equipos
 * 
 * @param {string} id - El ID del equipo.
 * @returns {object} El equipo eliminado.
 */
router.delete("/", [auth, admin], async (req, res) => {
    const id = req.body.id;
    const sql = "DELETE FROM equipos WHERE id_equipo = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

module.exports = router;
