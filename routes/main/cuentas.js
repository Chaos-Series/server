// Importamos dependencias
const express = require("express");
const axios = require("axios");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const db = require("../../middleware/db");

// Set del router
const router = express.Router();

const RIOT_API = "RGAPI-48c2e07c-b903-4720-be64-d3ba9a416206";

// *************************
// Set de todos los endpoints
// *************************

router.get("/", [auth, viewer], (req, res) => {
    // /usuarios
    // recibimos todos los usuarios
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
    // /cuenta/nombre=:nombre
    // recibimos el nombre de invocador a partir de su nombre
    const nombre = req.params.nombre;
    const tag = req.params.tag;

    axios.get("https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" + nombre + "/" + tag + "?api_key=" + RIOT_API).then((cuentaRiot) => {
        if (cuentaRiot.data["puuid"] != null && cuentaRiot.data["gameName"] != null) {
            const sqlSelect = "SELECT invocador, tag, puuid_lol FROM cuentas_lol WHERE invocador = ? AND tag = ?";
            db.query(sqlSelect, [nombre, tag], (err, result) => {
                if (err) {
                    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
                } else {
                    if (result.length == 0) {
                        res.send({ status: 200, success: true, result: cuentaRiot.data, existe: false });
                    } else {
                        res.send({ status: 200, success: true, result: result, existe: true });
                    }
                }
            });
        } else {
            res.send({ status: 404, success: false, reason: "La cuenta no existe.", existe: false });
        }
    });
});

router.post("/", [auth, self], async (req, res) => {
    // /crearcuenta
    // creamos un usuario
    idusuario = req.body.id_usuario;
    invocador = req.body.invocador;
    tag = req.body.tag;
    puuid = req.body.puuid;
    lineaprincipal = req.body.linea_principal;
    lineasecundaria = req.body.linea_secundaria;

    const sql =
        "INSERT INTO `cuentas_lol` (`id_cuenta`, `id_usuario`, `id_juego`, `invocador`, `tag`, `puuid_lol`, `linea_principal`, `linea_secundaria`) VALUES (NULL, ?, 1, ?, ?, ?, ?, ?)";
    db.query(sql, [idusuario, invocador, tag, puuid, lineaprincipal, lineasecundaria], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.put("/", [auth, self], async (req, res) => {
    // /cuenta
    // modificamos un usuario
    id = req.body.id;
    puuid_lol = req.body.puuid_lol;
    invocador = req.body.invocador;

    const sql = "UPDATE cuentas_lol SET invocador = ?, puuid_lol = ? WHERE id_cuenta = ?";
    db.query(sql, [invocador, puuid_lol, id], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

router.delete("/", [auth, self], async (req, res) => {
    // /eliminarcuenta
    // eliminamos una cuenta a partir de su id
    id_cuenta = req.body.id_cuenta;

    const sqlDelete = "DELETE FROM cuentas_lol WHERE id_cuenta = ?";
    db.query(sqlDelete, [id_cuenta], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
});

// Exportamos el router
module.exports = router;
