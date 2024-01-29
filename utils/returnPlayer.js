const db = require("../middleware/db");

async function returnPlayerList(res) {
    const sqlInfo = "SELECT id_usuario, id_equipo, nombre_usuario, apellido_usuario, nick_usuario, icono, circuitotormenta, twitter, discord FROM usuarios WHERE rol = 1 AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'";
    const sqlCuentas = "SELECT * FROM cuentas_lol";
    const sqlEquipo = "SELECT * FROM equipos";
    const sqlEstadisticas = "SELECT * FROM estadisticas_usuarios";

    try {
        let usuarios = await query(sqlInfo);
        let cuentas = await query(sqlCuentas);
        let equipos = await query(sqlEquipo);
        let estadisticas = await query(sqlEstadisticas);

        usuarios = usuarios.filter((info) => {
            let equipo = equipos.find((equipo) => equipo.id_equipo == info.id_equipo);
            let estadistica = estadisticas.find((estadistica) => estadistica.id_usuario == info.id_usuario);
            let cuentasUser = cuentas.filter((cuenta) => cuenta.id_usuario == info.id_usuario);

            info.equipo = equipo === undefined ? [] : equipo;
            info.estadisticas = estadistica === undefined ? [] : estadistica;
            info.cuentas = cuentasUser;

            return info.equipo.length != 0;
        });

        res.send({ status: 200, success: true, result: usuarios });
    } catch (error) {
        res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
    }
}

async function returnPlayer(id, res) {
    const sqlUser = "SELECT id_usuario, id_equipo, id_discord, nombre_usuario, apellido_usuario, nick_usuario, edad, rol, icono, usuario_activado, circuitotormenta, twitter, discord FROM usuarios WHERE id_usuario = ?";
    const sqlEquipo = "SELECT * FROM equipos WHERE id_equipo = ?";
    const sqlCuentas = "SELECT * FROM cuentas_lol WHERE id_usuario = ?";

    try {
        let usuario = { info: {}, equipo: {}, cuentas: {}, estadisticas: {} };

        usuario.info = (await query(sqlUser, [id]))[0];
        usuario.cuentas = await query(sqlCuentas, [id]);

        if (usuario.info["id_equipo"]) {
            usuario.equipo = (await query(sqlEquipo, usuario.info["id_equipo"]))[0];
        }

        res.send({ status: 200, success: true, result: usuario });
    } catch (error) {
        res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
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

module.exports = { returnPlayer, returnPlayerList, query };