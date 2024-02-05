// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { self, viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();
const RIOT_API = process.env.RIOT_API;


/**
 * Obtiene todas las cuentas de LoL de todos los usuarios.
 * 
 * @route GET /cuentas
 * 
 * @returns {object} Todas las cuentas de LoL de todos los usuarios.
 */
router.get("/", [auth, viewer], (req, res) => {
    const sqlSelect = "SELECT id_cuenta, invocador, puuid_lol FROM cuentas_lol";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Obtiene el nombre de invocador a partir de su nombre.
 * 
 * @route GET /cuentas/nombre=:nombre&tag=:tag
 * 
 * @param {string} nombre - El nombre de invocador.
 * @param {string} tag - El tag de invocador.
 * @returns {object} El nombre de invocador a partir de su nombre.
 */
router.get("/nombre=:nombre&tag=:tag", [auth, viewer], (req, res) => {
    const { nombre, tag } = req.params;

    axios
        .get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${nombre}/${tag}?api_key=${RIOT_API}`).then((cuentaRiot) => {
            const sqlSelect = "SELECT invocador, tag, puuid_lol FROM cuentas_lol WHERE invocador = ? AND tag = ?";
            
            if (!cuentaRiot.data.puuid) return res.send({ status: 404, success: false, reason: "La cuenta no existe.", existe: false });
            
            db.query(sqlSelect, [nombre, tag], (err, result) => {
                if (err) {
                    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
                } else {
                    if (result.length === 0) {
                        res.send({ status: 200, success: true, result: cuentaRiot.data, existe: false });
                    } else {
                        res.send({ status: 200, success: true, result: result, existe: true });
                    }
                }
            });
        })
        .catch((err) => {
            res.send({ status: 500, success: false, reason: "Problema con la API de Riot.", error: err.response.statusText });
        });
});


/**
 * Obtiene los datos de una cuenta a partir de su puuid.
 * 
 * @route GET /cuentas/puuid=:puuid
 * 
 * @param {string} puuid - El puuid de la cuenta.
 * @returns {object} Los datos de una cuenta de LoL a partir de su puuid.
 */
router.get("/puuid=:puuid", [auth, viewer], (req, res) => {
    const { puuid } = req.params;

    axios
        .get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${RIOT_API}`).then((cuentaRiot) => {
            if (cuentaRiot.data.puuid && cuentaRiot.data.gameName) {
                res.send({ status: 200, success: true, result: cuentaRiot.data, existe: true });
            } else {
                res.send({ status: 404, success: false, reason: "La cuenta no existe.", existe: false });
            }
        })
        .catch((err) => {
            res.send({ status: 500, success: false, reason: "Problema con la API de Riot.", error: err.response.statusText });
        });
});


/**
 * Crea una cuenta de LoL de un usuario.
 * 
 * @route POST /cuentas
 * 
 * @param {string} id_usuario - El ID del usuario.
 * @param {string} invocador - El nombre de invocador.
 * @param {string} tag - El tag de invocador.
 * @param {string} puuid - El puuid de la cuenta.
 * @param {string} linea_principal - La línea principal de la cuenta.
 * @param {string} linea_secundaria - La línea secundaria de la cuenta.
 * @returns {object} El resultado de la query
 */
router.post("/", [auth, self], async (req, res) => {
    const { id_usuario, invocador, tag, puuid, linea_principal, linea_secundaria } = req.body;

    const sql = "INSERT INTO `cuentas_lol` (`id_cuenta`, `id_usuario`, `id_juego`, `invocador`, `tag`, `puuid_lol`, `linea_principal`, `linea_secundaria`) VALUES (NULL, ?, 1, ?, ?, ?, ?, ?)";
    db.query(sql, [id_usuario, invocador, tag, puuid, linea_principal, linea_secundaria], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Modifica una cuenta de un usuario.
 * 
 * @route PUT /cuentas
 * 
 * @param {string} id - El ID de la cuenta.
 * @param {string} invocador - El nombre de invocador.
 * @param {string} tag - El tag de invocador.
 * @param {string} puuid - El puuid de la cuenta.
 * @param {string} linea_principal - La línea principal de la cuenta.
 * @param {string} linea_secundaria - La línea secundaria de la cuenta.
 * @returns {object} El resultado de la query
 */
router.put("/", [auth, self], async (req, res) => {
    const { id, invocador, tag, puuid_lol, linea_principal, linea_secundaria } = req.body;

    const sql = "UPDATE cuentas_lol SET invocador = ?, puuid_lol = ?, linea_principal = ?, linea_secundaria = ?, tag = ? WHERE id_cuenta = ?";
    db.query(sql, [invocador, puuid_lol, linea_principal, linea_secundaria, tag, id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});


/**
 * Elimina una cuenta de un usuario.
 * 
 * @route DELETE /cuentas
 * 
 * @param {string} id_cuenta - El ID de la cuenta.
 * @returns {object} El resultado de la query
 */
router.delete("/", [auth, self], async (req, res) => {
    const { id_cuenta } = req.body;

    const sqlDelete = "DELETE FROM cuentas_lol WHERE id_cuenta = ?";
    db.query(sqlDelete, [id_cuenta], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

module.exports = router;
