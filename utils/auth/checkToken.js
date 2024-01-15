// Importamos middlewares
const db = require("../../middleware/db");

function checkToken(token, res) {
    const sqlComprobar = "SELECT id_usuario, token, expire FROM sesiones WHERE token = ?";

    db.query(sqlComprobar, token, (err, result) => {
        // sacamos la expiración
        let now = new Date();
        now.setMonth(now.getMonth() + 1);
        let fecha = Math.floor(now.getTime() / 1000);
        if (err) {
            res.send({ status: 500, sucess: false, reason: "Problema de base de datos.", error: err });
        } else {
            if (result.length == 0) {
                // si no existe la sesion en la base de datos
                res.send({ status: 401, success: false, reason: "El token no es válido." });
            } else {
                //si existe en la base de datos
                if (result[0]["expire"] > Math.floor(new Date().getTime() / 1000.0)) {
                    //comprobamos si el token ha expirado
                    res.send({ status: 200, success: true, reason: "El token es válido", token: result[0]["token"] });
                } else {
                    //si esta expirado, creamos uno nuevo borrando el anterior
                    res.send({ status: 401, success: false, reason: "El token ha expirado." });
                }
            }
        }
    });
}

module.exports = checkToken;
