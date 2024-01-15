// Importamos middlewares
const db = require("../../middleware/db");

function createUser(datos, contra, res) {
    nombre = datos.nombre;
    apellido = datos.apellido;
    nick = datos.usuario;
    edad = datos.fecha;
    rol = datos.rol ? datos.rol : 0;

    const sql =
        "INSERT INTO `usuarios` (`id_usuario`, `id_equipo`, `id_discord`, `nombre_usuario`, `apellido_usuario`, `nick_usuario`, `edad`, `rol`, `contra`) VALUES (NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, apellido, nick, Date.parse(edad) / 1000.0, rol, contra], (err, result) => {
        if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
            res.send({ status: 200, success: true, result: result });
        }
    });
}

module.exports = createUser;
