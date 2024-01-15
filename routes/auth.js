// Importamos dependencias
const jwt = require("jsonwebtoken");
const express = require("express");

// Importamos middlewares
const auth = require("../middleware/auth");
const { admin, viewer, self } = require("../middleware/roles");
const db = require("../middleware/db");

// Importamos utils
const checkToken = require("../utils/auth/checkToken");
const createUser = require("../utils/auth/createUser")
const returnUser = require("../utils/auth/returnUser")

// Set del router
const router = express.Router();

router.post("/", async (req, res) => {
    const sqlComprobar = "SELECT id_usuario, token, expire FROM sesiones WHERE id_usuario = ?";

    const sqlSelect = "SELECT id_usuario, rol, contra FROM usuarios WHERE nick_usuario = ?";
    const sqlInsertToken = "INSERT INTO sesiones (id_usuario, fecha, token, expire) VALUES (?, ?, ?, ?)";
    const sqlDeleteToken = "DELETE FROM sesiones WHERE id_usuario = ?";
    if (req.body.type == "inicio") {
        if (!req.body.token) {
            res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
        } else {
            checkToken(req.body.token, res);
        }
    } else if(req.body.type == "registro"){
        createUser(req.body.datos, req.body.contra, res)
    } else if (req.body.type == "buscar"){
        returnUser(req.body.token, res)
    } else if (req.body.type == "main") {
        db.query(sqlSelect, [req.body.nick], (err, result) => {
            if (err) {
                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
            } else if (!req.body.nick || !req.body.contra) {
                res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
            } else {
                // comprobamos que el usuario existe en la bbdd
                if (result.length == 0) {
                    res.send({ status: 401, success: false, reason: "El usuario no existe." });
                } else {
                    //Comprobar si se han enviado el nick y contraseña
                    let user = result[0];
                    // Comparar contraseña con la de la base de datos
                    const valid = user["contra"] == req.body.contra;
                    if (!valid) {
                        res.send({ status: 401, success: false, reason: "Credenciales erróneas." });
                    } else {
                        db.query(sqlComprobar, [user["id_usuario"]], (err3, result3) => {
                            // sacamos la expiración
                            let now = new Date();
                            now.setMonth(now.getMonth() + 1);
                            let fecha = Math.floor(now.getTime() / 1000);
                            if (err3) {
                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err3 });
                            } else {
                                if (result3.length == 0) {
                                    // si no existe la sesion en la base de datos
                                    const token = jwt.sign({ id: user["id_usuario"], rol: user["rol"] }, "jwtPrivateKey"); //creamos la token
                                    db.query(sqlInsertToken, [user["id_usuario"], Math.floor(new Date().getTime() / 1000.0), token, fecha], (err2, result2) => {
                                        if (err2) {
                                            res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err2 });
                                        } else {
                                            if (!result2.affectedRows)
                                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err2 });
                                            res.send({ status: 200, sucess: true, token: token });
                                        }
                                    });
                                } else {
                                    //si existe en la base de datos
                                    if (result3[0]["expire"] > Math.floor(new Date().getTime() / 1000.0)) {
                                        //comprobamos si el token ha expirado
                                        res.send({ status: 200, success: true, reason: "El token ya existe.", token: result3[0]["token"] });
                                    } else {
                                        //si esta expirado, creamos uno nuevo borrando el anterior
                                        const token = jwt.sign({ id: user["id_usuario"], rol: user["rol"] }, "jwtPrivateKey");
                                        db.query(sqlDeleteToken, [user["id_usuario"]], (err4, result4) => {
                                            if (err4) {
                                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err4 });
                                            } else {
                                                if (!result4.affectedRows)
                                                    res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err4 });
                                                db.query(
                                                    sqlInsertToken,
                                                    [user["id_usuario"], Math.floor(new Date().getTime() / 1000.0), token, fecha],
                                                    (err5, result5) => {
                                                        if (err5) {
                                                            res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err5 });
                                                        } else {
                                                            res.send({ status: 200, sucess: true, token: token });
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
    }
});

router.post("/admin", [auth, admin], async (req, res) => {
    const sqlComprobar = "SELECT id_usuario, token, expire FROM sesiones WHERE id_usuario = ?";

    const sqlSelect = "SELECT id_usuario, rol, contra FROM usuarios WHERE nick_usuario = ?";
    const sqlInsertToken = "INSERT INTO sesiones (id_usuario, fecha, token, expire) VALUES (?, ?, ?, ?)";
    const sqlDeleteToken = "DELETE FROM sesiones WHERE id_usuario = ?";
    if (req.body.type == "inicio") {
        if (!req.body.token) {
            res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
        } else {
            checkToken(req.body.token, res);
        }
    } else if(req.body.type == "registro"){
        createUser(req.body.datos, req.body.contra, res)
    } else if (req.body.type == "buscar"){
        returnUser(req.body.token, res)
    } else if (req.body.type == "main") {
        db.query(sqlSelect, [req.body.nick], (err, result) => {
            if (err) {
                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
            } else if (!req.body.nick || !req.body.contra) {
                res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
            } else {
                // comprobamos que el usuario existe en la bbdd
                if (result.length == 0) {
                    res.send({ status: 401, success: false, reason: "El usuario no existe." });
                } else {
                    //Comprobar si se han enviado el nick y contraseña
                    let user = result[0];
                    // Comparar contraseña con la de la base de datos
                    const valid = user["contra"] == req.body.contra;
                    if (!valid) {
                        res.send({ status: 401, success: false, reason: "Credenciales erróneas." });
                    } else {
                        db.query(sqlComprobar, [user["id_usuario"]], (err3, result3) => {
                            // sacamos la expiración
                            let now = new Date();
                            now.setMonth(now.getMonth() + 1);
                            let fecha = Math.floor(now.getTime() / 1000);
                            if (err3) {
                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err3 });
                            } else {
                                if (result3.length == 0) {
                                    // si no existe la sesion en la base de datos
                                    const token = jwt.sign({ id: user["id_usuario"], rol: user["rol"] }, "jwtPrivateKey"); //creamos la token
                                    db.query(sqlInsertToken, [user["id_usuario"], Math.floor(new Date().getTime() / 1000.0), token, fecha], (err2, result2) => {
                                        if (err2) {
                                            res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err2 });
                                        } else {
                                            if (!result2.affectedRows)
                                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err2 });
                                            res.send({ status: 200, sucess: true, token: token });
                                        }
                                    });
                                } else {
                                    //si existe en la base de datos
                                    if (result3[0]["expire"] > Math.floor(new Date().getTime() / 1000.0)) {
                                        //comprobamos si el token ha expirado
                                        res.send({ status: 200, success: true, reason: "El token ya existe.", token: result3[0]["token"] });
                                    } else {
                                        //si esta expirado, creamos uno nuevo borrando el anterior
                                        const token = jwt.sign({ id: user["id_usuario"], rol: user["rol"] }, "jwtPrivateKey");
                                        db.query(sqlDeleteToken, [user["id_usuario"]], (err4, result4) => {
                                            if (err4) {
                                                res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err4 });
                                            } else {
                                                if (!result4.affectedRows)
                                                    res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err4 });
                                                db.query(
                                                    sqlInsertToken,
                                                    [user["id_usuario"], Math.floor(new Date().getTime() / 1000.0), token, fecha],
                                                    (err5, result5) => {
                                                        if (err5) {
                                                            res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err5 });
                                                        } else {
                                                            res.send({ status: 200, sucess: true, token: token });
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.send({ status: 401, success: false, reason: "No se han enviado datos suficientes." });
    }
});

module.exports = router;
