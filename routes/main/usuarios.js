// Importamos dependencias
const express = require("express");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const { returnQuery } = require("../../utils/returnQuery");

//Importtamos utils
const { returnPlayer, returnPlayerList, query } = require("../../utils/returnPlayer");

// Set del router
const router = express.Router();

// *************************
// Set up the route handlers
// *************************

/**
 * Obtiene todos los usuarios.
 * 
 * @route GET /usuarios
 * 
 * @returns {object} Todos los usuarios.
 */
router.get("/", (req, res) => {
  const sqlSelect = "SELECT * FROM usuarios";
  returnQuery(sqlSelect, res);
});


/**
 * Obtiene todos los jugadores con su información, cuentas, equipo, y estadísticas.
 * 
 * @route GET /usuarios/jugadores
 * 
 * @returns {object} Todos los jugadores.
 */
router.get("/jugadores", async (req, res) => {
  returnPlayerList(res);
});


/**
 * Obtiene todos los jugadores de un equipo por el ID del equipo.
 * 
 * @route GET /usuarios/jugadores/equipo=:id
 * 
 * @param {number} id - El ID del equipo.
 * @returns {object} La lista de jugadores del equipo
 */
router.get("/jugadores/equipo=:id", async (req, res) => {
  const { id_equipo } = req.params;

  const sqlSelect =
    "SELECT id_usuario FROM usuarios WHERE rol = 1 AND id_equipo = ? AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'";

  await returnQuery(sqlSelect, res, [id_equipo], false)
    .then((result) => {
      const lista = result.map((jugador) => returnPlayerList(jugador.id_usuario));
      res.send({ status: 200, success: true, result: lista });
    })
    .catch((err) => {
      console.log(err);
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    });
});


/**
 * Obtiene todos los staff de un equipo por el ID de equipo.
 * 
 * @route GET /usuarios/staff/equipo=:id
 * 
 * @param {number} id - El ID del equipo.
 * @returns {object} La lista de staff del equipo
 */
router.get("/staff/equipo=:id", async (req, res) => {
  const { id_equipo } = req.params;

  const sqlSelect =
    "SELECT id_usuario FROM usuarios WHERE rol > 4 AND rol < 9 AND id_equipo = ? AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'";

  await returnQuery(sqlSelect, res, [id_equipo], false)
    .then((result) => {
      const lista = result.map((staff) => returnPlayerList(staff.id_usuario));
      res.send({ status: 200, success: true, result: lista });
    })
    .catch((err) => {
      console.log(err);
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    });
});


/**
 * Obtiene toda la información de un usuario por su ID.
 * 
 * @route GET /usuarios/id=:id
 * 
 * @returns {object} La información del usuario.
 */
router.get("/id=:id", [auth, viewer], (req, res) => {
  const { id } = req.params;
  returnPlayer(id, res);
});


/**
 * Obtiene toda la información de un usuario por su nombre.
 * 
 * @route GET /usuarios/nombre=:nombre
 * 
 * @param {string} nombre - El nombre del usuario.
 * @returns {object} La información del usuario.
 */
router.get("/nombre=:nombre", (req, res) => {
  const { nombre } = req.params;
  returnQuery("SELECT nombre_usuario FROM usuarios WHERE nick_usuario = ?", res, [nombre]);
});


/**
 * Obtiene el nombre de usuario de un usuario por su nombre y contraseña.
 * 
 * @route GET /usuarios/nombre=:nombre/contra=:contra
 * 
 * @param {string} nombre - El nombre del usuario.
 * @param {string} contra - La contraseña del usuario.
 * @returns {string} El nombre de usuario.
 */
router.get("/nombre=:nombre/contra=:contra", async (req, res) => {
  const { nombre, contra } = req.params;
  await returnQuery("SELECT nick_usuario, contra FROM usuarios WHERE nick_usuario = ?", res, [nombre], false)
    .then((result) => {
      if (result.length === 0) return res.send({ status: 404, success: false, reason: "El usuario no existe." });

      if (result[0]["contra"] == contra) {
        res.send({ status: 200, success: true, result: result[0]["nick_usuario"] });
      } else {
        res.send({ status: 401, success: false, reason: "Credenciales erróneas." });
      }
    })
    .catch((err) => {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    });
});


/**
 * Obtiene el equipo de un usuario por su ID.
 * 
 * @route GET /usuarios/equipo/id=:id
 * 
 * @param {number} id - El ID del usuario.
 * @returns {object} El equipo del usuario.
 */
router.get("/equipo/id=:id", [auth, viewer], (req, res) => {
  const { id } = req.params;
  returnQuery("SELECT * FROM equipos LEFT JOIN usuarios ON equipos.id_equipo = usuarios.id_equipo LEFT JOIN ligas ON equipos.id_liga = ligas.id_liga LEFT JOIN temporadas ON equipos.id_temporada = temporadas.id_temporada WHERE usuarios.id_usuario = ?", res, [id]);
});


/**
 * Obtiene las cuentas de un usuario por su ID.
 * 
 * @route GET /usuarios/cuentas/id=:id
 * 
 * @param {number} id - El ID del usuario.
 * @returns {object} Las cuentas del usuario.
 */
router.get("/cuentas/id=:id", [auth, viewer], (req, res) => {
  const { id } = req.params;
  returnQuery("SELECT * FROM `cuentas_lol` LEFT JOIN usuarios ON cuentas_lol.id_usuario = usuarios.id_usuario WHERE usuarios.id_usuario = ?", res, [id]);
});


/**
 * Obtiene los enlaces de un usuario a partir de su ID.
 * 
 * @route GET /usuarios/enlaces/id=:id
 * 
 * @param {number} id - El ID del usuario.
 * @returns {object} Los enlaces del usuario.
 */
router.get("/enlaces/id=:id", [auth, viewer], (req, res) => {
  const id = req.params.id;
  returnQuery("SELECT id_usuario, id_discord, circuitotormenta, twitter FROM `usuarios` WHERE usuarios.id_usuario = ?", res, [id]);
});


/**
 * Crea un usuario.
 * 
 * @route POST /usuarios
 * 
 * @param {string} nombre - El nombre del usuario.
 * @param {string} apellido - El apellido del usuario.
 * @param {string} nick - El nick del usuario.
 * @param {number} edad - La edad del usuario.
 * @param {number} rol - El rol del usuario.
 * @param {string} contra - La contraseña del usuario.
 * @returns {object} El usuario creado.
 */
router.post("/", [auth, admin], async (req, res) => {
  const { nombre, apellido, nick, edad, rol, contra } = req.body;
  returnQuery("INSERT INTO `usuarios` (`id_usuario`, `id_equipo`, `id_discord`, `nombre_usuario`, `apellido_usuario`, `nick_usuario`, `edad`, `rol`, `contra`) VALUES (NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)", res, [nombre, apellido, nick, edad, rol ?? 0, contra]);
});


/**
 * Modifica un usuario.
 * 
 * @route PUT /usuarios
 * 
 * @param {number} id_usuario - El ID del usuario.
 * @param {string} columna - La columna a modificar.
 * @param {string} valor - El valor a modificar.
 * @returns {object} El usuario modificado.
 */
router.put("/", [auth, self], async (req, res) => {
  const { id_usuario, columna, valor } = req.body;
  returnQuery("UPDATE usuarios SET `" + columna + "` = ? WHERE id_usuario = ?", res, [valor, id_usuario]);
});


/**
 * Modifica el icono de un usuario a partir de su ID.
 * 
 * @route PUT /usuarios/icono
 * 
 * @param {number} id - El ID del usuario.
 * @param {string} icono - El icono del usuario.
 * @returns {object} El usuario modificado.
 */
router.put("/icono", [auth, admin], async (req, res) => {
  const { id, icono } = req.body;
  returnQuery("UPDATE usuarios SET icono = ? WHERE id_usuario = ?", res, [icono, id]);
});


/**
 * Modifica un enlace de un usuario.
 * 
 * @route PUT /usuarios/enlaces
 * 
 * @param {number} id_usuario - El ID del usuario.
 * @param {string} columna - La columna a modificar.
 * @param {string} valor - El valor a modificar.
 * @returns {object} El usuario modificado.
 */
router.put("/enlaces", [auth, self], async (req, res) => {
  const { id_usuario, columna, valor } = req.body;

  const sqlComprobar = "SELECT " + columna + " FROM usuarios WHERE " + columna + " = ?";
  const sqlUpdate = "UPDATE usuarios SET " + columna + " = ? WHERE id_usuario = ?";
  returnQuery(sqlComprobar, res, [valor], false).then((result) => {
    if (result.length == 0) {
      returnQuery(sqlUpdate, res, [valor, id_usuario]);
    } else {
      res.send({ status: 409, success: false, reason: "Esta cuenta ya está enlazada." });
    };
  })
});


/**
 * Elimina un usuario a partir de su ID.
 * 
 * @route DELETE /usuarios
 * 
 * @param {number} id - El ID del usuario.
 * @returns {object} El usuario eliminado.
 */
router.delete("/", [auth, admin], async (req, res) => {
  const { id } = req.body;

  try {
    returnQuery("DELETE FROM logs WHERE id_usuario = ?", res, [id], false); // eliminar logs
    returnQuery("DELETE FROM sesiones WHERE id_usuario = ?", res, [id], false); // eliminar sesiones
    returnQuery("DELETE FROM cuentas_lol WHERE id_usuario = ?", res, [id], false); // eliminar cuentas
    returnQuery("DELETE FROM usuarios WHERE id_usuario = ?", res, [id], false); // eliminar usuario

    res.send({ status: 200, success: true });
  } catch (err) {
    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
  }
});


/**
 * Elimina un enlace de un usuario.
 * 
 * @route DELETE /usuarios/enlaces
 * 
 * @param {number} id_usuario - El ID del usuario.
 * @param {string} columna - La columna a modificar.
 * @returns {object} El usuario modificado.
 */
router.delete("/enlaces", [auth, self], async (req, res) => {
  const { id_usuario, columna } = req.body;
  returnQuery("UPDATE usuarios SET " + columna + " = null WHERE id_usuario = ?", res, [id_usuario]);
});

// Exportamos el router
module.exports = router;