// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { self, viewer } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();
const RIOT_API = "RGAPI-48c2e07c-b903-4720-be64-d3ba9a416206";

router.get("/", [auth, viewer], (req, res) => {
    // GET /cuentas
    // recibimos todas las cuentas de LoL de todos los usuarios
    const sqlSelect = "SELECT id_cuenta, invocador, puuid_lol FROM cuentas_lol";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.get("/nombre=:nombre&tag=:tag", [auth, viewer], (req, res) => {
    // GET /cuentas/nombre=:nombre&tag=:tag
    // recibimos el nombre de invocador a partir de su nombre
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

router.get("/puuid=:puuid", [auth, viewer], (req, res) => {
    // GET /cuentas/puuid=:puuid
    // recibimos datos de la cuenta a partir de su puuid
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

router.post("/", [auth, self], async (req, res) => {
    // POST /cuentas
    // creamos un usuario
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

router.put("/", [auth, self], async (req, res) => {
    // PUT /cuentas
    // modificamos una cuenta de un usuario
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

router.delete("/", [auth, self], async (req, res) => {
    // DELETE /cuentas
    // eliminamos una cuenta a partir de su id
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
