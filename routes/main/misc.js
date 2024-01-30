// Importamos dependencias
const express = require("express");

// Importamos middlewares
const db = require("../../middleware/db");
const sendEmail = require("../../utils/sendEmail");

// Set del router
const router = express.Router();


/**
 * Crea un registro en la tabla de logs.
 * 
 * @route POST /misc/enviarlog
 * 
 * @param {string} id_usuario - El ID del usuario.
 * @param {string} fecha - La fecha del log.
 * @param {string} accion - La acción del log.
 * @param {string} info - La información del log.
 * @returns {object} El resultado de la query.
 */
router.post("/enviarlog", async (req, res) => {
    // POST /misc/enviarlog
    // creamos un log
    const { id_usuario, fecha, accion, info } = req.body;

    const sqlInsert = "INSERT INTO `logs` (`id_log`, `id_usuario`, `fecha`, `accion`, `info`) VALUES (NULL, ?, ?, ?, ?)";
    db.query(sqlInsert, [id_usuario, fecha, accion, info], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Envía un email de contacto.
 * 
 * @route POST /misc/enviarcontacto
 * 
 * @param {string} nombre - El nombre del usuario.
 * @param {string} correo - El correo del usuario.
 * @param {string} asunto - El asunto del mensaje.
 * @param {string} mensaje - El mensaje del usuario.
 * @returns {object} El resultado de la query.
 */
router.post("/enviarcontacto", async (req, res) => {
    // POST /misc/enviarcontacto
    // enviamos un email de contacto
    const { nombre, correo, asunto, mensaje } = req.body;

    sendEmail(nombre, correo, asunto, mensaje)
        .then((result) => res.send({ status: 200, success: true, result: result }))
        .catch((err) => res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err }));
});

module.exports = router;
