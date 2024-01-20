// Importamos middlewares
const db = require("../middleware/db");

function returnPlayer(id, res) {
    let usuario = { info: {}, equipo: {}, cuentas: {}, estadisticas: {} };

    const sqlUser =
        "SELECT id_usuario, id_equipo, id_discord, nombre_usuario, apellido_usuario, nick_usuario, edad, rol, icono, usuario_activado, circuitotormenta, twitter, discord FROM usuarios WHERE id_usuario = ?";
    const sqlEquipo = "SELECT * FROM equipos WHERE id_equipo = ?";
    const sqlCuentas = "SELECT * FROM cuentas_lol WHERE id_usuario = ?";
    //const sqlEstadisticas = ""

    db.query(sqlUser, [id], (err2, result2) => {
        if (err2) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos 2.", error: err2 });
        } else {
            usuario.info = result2[0];
            db.query(sqlCuentas, [id], (err3, result3) => {
                if (err3) {
                    res.send({ status: 500, success: false, reason: "Problema con la base de datos 3.", error: err3 });
                } else {
                    usuario.cuentas = result3;
                    if (usuario.info["id_equipo"]) {
                        db.query(sqlEquipo, usuario.info["id_equipo"], (err4, result4) => {
                            if (err4) {
                                res.send({ status: 500, success: false, reason: "Problema con la base de datos 4.", error: err4 });
                            } else {
                                usuario.equipo = result4[0];
                                res.send({ status: 200, success: true, result: usuario });
                            }
                        });
                    } else {
                        res.send({ status: 200, success: true, result: usuario });
                    }
                }
            });
        }
    });
}

async function returnPlayerList(res) {
    let usuarios = [];
    const sqlInfo = "SELECT id_usuario, id_equipo, nombre_usuario, apellido_usuario, nick_usuario, icono, circuitotormenta, twitter, discord FROM usuarios WHERE rol = 1 AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'";
    const sqlCuentas = "SELECT * FROM cuentas_lol";
    const sqlEquipo = "SELECT * FROM equipos";
    const sqlEstadisticas = "SELECT * FROM estadisticas_usuarios";

    try {
        let informacion;
        let cuentas;
        let equipos;
        let estadisticas;
        
        db.query(sqlInfo, (error, result) => {
            if (error) {
                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
            } else {
                informacion = result;
                db.query(sqlCuentas, (error, result) => {
                    if (error) {
                        res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
                    } else {
                        cuentas = result;
                        db.query(sqlEquipo, (error, result) => {
                            if (error) {
                                res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
                            } else {
                                equipos = result;
                                db.query(sqlEstadisticas, (error, result) => {
                                    if (error) {
                                        res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
                                    } else {
                                        estadisticas = result;

                                        //Si recibimos toda la información, procesamos los datos.
                                        if(informacion.length > 0 && cuentas.length > 0 && equipos.length > 0){ 
                                            informacion.forEach((info) => {
                                                let usuario = { user: {}, cuentas: {}, equipo: {}, estadisticas: {} };
                                                let equipo = equipos.find((equipo) => equipo.id_equipo == info.id_equipo);
                                                let estadistica = estadisticas.find((estadistica) => estadistica.id_usuario == info.id_usuario);
                                                let cuentasUser = cuentas.filter((cuenta) => cuenta.id_usuario == info.id_usuario);

                                                usuario.user = info; //Información del Usuario
                                                usuario.cuentas = cuentasUser; //Cuentas del Usuario
                                                usuario.equipo = equipo === undefined ? [] : equipo; // Si el Usuario no tiene Equipo, se indica un array Vacío (Para quitarlo en el filtro)
                                                usuario.estadisticas = estadistica === undefined ? [] : estadistica; // Si el Usuario no tiene Estadísticas, se indica un array Vacío (Para quitarlo en el filtro)
                                                
                                                //if(usuario.equipo.length != 0) //Filtrar los Usuarios que tengan Equipo
                                                usuarios.push(usuario);
                                            });
                                        }
                                        res.send({ status: 200, success: true, result: usuarios });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        throw error;
    }
}

function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {returnPlayer, returnPlayerList, query};
