// Importamos dependencias
const express = require("express");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");
const sendEmail = require("../../utils/sendEmail");

// Set del router
const router = express.Router();

// *************************
// Set de todos los endpoints
// *************************

router.post("/enviarlog", async (req, res) => {
    // /log
    // creamos un log
    const id_usuario = req.body.id_usuario;
    const fecha = req.body.fecha;
    const accion = req.body.accion;
    const info = req.body.info;

    const sqlInsert = "INSERT INTO `logs` (`id_log`, `id_usuario`, `fecha`, `accion`, `info`) VALUES (NULL, ?, ?, ?, ?)";
    db.query(sqlInsert, [id_usuario, fecha, accion, info], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.post("/enviarcontacto", async (req, res) => {
    // /enviarcontacto
    // mandamos un correo
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const asunto = req.body.asunto;
    const mensaje = req.body.mensaje;

    sendEmail(nombre, correo, asunto, mensaje)
        .then((result) => res.send({ status: 200, success: true, result: result }))
        .catch((err) => res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err }));
});

// Exportamos el router
module.exports = router;
