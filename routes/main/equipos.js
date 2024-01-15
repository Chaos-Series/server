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

const upload = multer({
    storage: storage,
});

// Set del router
const router = express.Router();

// *************************
// Set de todos los endpoints
// *************************

router.get("/", [auth, viewer], (req, res) => {
    // /equipos
    // recibimos todos los equipos
    const sqlSelect = "SELECT * FROM equipos";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.get("/id=:id", [auth, viewer], (req, res) => {
    // /equipos/id=:id
    // buscamos equipo por id
    const id = req.params.id;

    const sqlSelect =
        "SELECT * FROM equipos LEFT JOIN ligas ON equipos.id_liga = ligas.id_liga LEFT JOIN temporadas ON equipos.id_temporada = temporadas.id_temporada WHERE equipos.id_equipo = ?";
    db.query(sqlSelect, [id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.get("/nombre=:nombre", [auth, viewer], (req, res) => {
    // /equipos/nombre=:nombre
    // buscamos equipo por id
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

router.get("/usuarios/id=:id", [auth, viewer], (req, res) => {
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

router.post("/", [auth, admin], upload.single("imagenEquipo"), async (req, res) => {
    // /crearequipo
    // crearmos un equipo
    image = req.file;
    nombre = req.body.nombre;
    acronimo = req.body.acronimo;

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
    // /modificarequipo
    // modificamos un equipo a partir de su id
    id = req.body.id;
    columna = req.body.columna;
    valor = req.body.valor;

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
    // /borrarequipo
    // eliminamos un equipo a partir de su id
    id = req.body.id;

    const sql = "DELETE FROM equipos WHERE id_equipo = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

// Exportamos el router
module.exports = router;
