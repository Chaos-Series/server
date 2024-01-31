const db = require("../middleware/db");
const { returnQuery } = require("./returnQuery");

async function returnPlayerList(res) {
    try {
        let usuarios = await returnQuery("SELECT id_usuario, id_equipo, nombre_usuario, apellido_usuario, nick_usuario, icono, circuitotormenta, twitter, discord FROM usuarios WHERE rol = 1 AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'", res, [], false);
        let cuentas = await returnQuery("SELECT * FROM cuentas_lol", res, [], false);
        let equipos = await returnQuery("SELECT * FROM equipos", res, [], false);
        let estadisticas = await returnQuery("SELECT * FROM estadisticas_usuarios", res, [], false);

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
    try {
        let usuario = { info: {}, equipo: {}, cuentas: {}, estadisticas: {} };

        usuario.info = (await returnQuery("SELECT id_usuario, id_equipo, id_discord, nombre_usuario, apellido_usuario, nick_usuario, edad, rol, icono, usuario_activado, circuitotormenta, twitter, discord FROM usuarios WHERE id_usuario = ?", res, [id], false))[0];
        usuario.cuentas = await returnQuery("SELECT * FROM cuentas_lol WHERE id_usuario = ?", res, [id], false);

        if (usuario.info["id_equipo"]) {
            usuario.equipo = (await returnQuery("SELECT * FROM equipos WHERE id_equipo = ?", res, usuario.info["id_equipo"], false))[0];
        }

        res.send({ status: 200, success: true, result: usuario });
    } catch (error) {
        res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
    }
}

module.exports = { returnPlayer, returnPlayerList };