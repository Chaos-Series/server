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

router.get("/", (req, res) => {
    // /equipos
    // recibimos todos los equipos
    const sqlSelect = "SELECT * FROM equipos";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result });
        }
    });
});

router.get("/id=:id", (req, res) => {
    // /equipos/id=:id
    // buscamos equipo por id
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

router.get("/nombre=:nombre", (req, res) => {
    // /equipos/nombre=:nombre
    // buscamos equipo por nombre
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

router.get("/usuarios/id=:id", (req, res) => {
    // /equipos/usuarios/id=:id
    // recibimos todos los usuarios dentro de un equipo a partir de su id
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

//;
router.get("/partidos/id=:id", (req, res) => {
    // /equipos/partidos/id=:id
    // recibimos todos los partidos de un equipo a partir de su id
    const id = req.params.id;
    const sqlSelect = "SELECT * FROM partidos WHERE tipo = 0 AND id_equipo1 = ? OR id_equipo2 = ? ORDER BY fecha";
    db.query(sqlSelect, [id, id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.post("/", [auth, admin], upload.single("imagenEquipo"), async (req, res) => {
    // /equipos
    // crear un equipo
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

router.put("/", [auth, admin], async (req, res) => {
    // /equipos
    // modificar un equipo
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

router.delete("/", [auth, admin], async (req, res) => {
    // /equipos
    // eliminamos un equipo a partir de su id
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
