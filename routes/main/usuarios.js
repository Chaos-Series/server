// Importamos dependencias
const express = require("express");

// Importamos middlewares
const auth = require("../../middleware/auth");
const { admin, viewer, self } = require("../../middleware/roles");
const db = require("../../middleware/db");

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
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
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
 * Obtiene toda la información de un usuario por su ID.
 * 
 * @route GET /usuarios/id=:id
 * 
 * @returns {object} La información del usuario.
 */
router.get("/id=:id", [auth, viewer], (req, res) => {
  const id = req.params.id;
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
  const nombre = req.params.nombre;

  const sqlSelect = "SELECT nombre_usuario FROM usuarios WHERE nick_usuario = ?";
  db.query(sqlSelect, [nombre], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
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
router.get("/nombre=:nombre/contra=:contra", (req, res) => {
  const { nombre, contra } = req.params;

  const sqlComprobarContra = "SELECT nick_usuario, contra FROM usuarios WHERE nick_usuario = ?";
  db.query(sqlComprobarContra, [nombre], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      if (result.length != 0) {
        if (result[0]["contra"] == contra) {
          res.send({ status: 200, success: true, result: result[0]["nick_usuario"] });
        } else {
          res.send({ status: 401, success: false, reason: "Credenciales erróneas." });
        }
      } else {
        res.send({ status: 404, success: false, reason: "El usuario no existe." });
      }
    }
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

  const sqlSelect =
    "SELECT * FROM equipos LEFT JOIN usuarios ON equipos.id_equipo = usuarios.id_equipo LEFT JOIN ligas ON equipos.id_liga = ligas.id_liga LEFT JOIN temporadas ON equipos.id_temporada = temporadas.id_temporada WHERE usuarios.id_usuario = ?";
  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/cuentas/id=:id", [auth, viewer], (req, res) => {
  // usuarios/cuentas/id=:id
  //buscamos cuentas por id de usuario
  const id = req.params.id;

  const sqlSelect = "SELECT * FROM `cuentas_lol` LEFT JOIN usuarios ON cuentas_lol.id_usuario = usuarios.id_usuario WHERE usuarios.id_usuario = ?";
  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/enlaces/id=:id", [auth, viewer], (req, res) => {
  // /usuarios/enlaces/id=:id
  //conseguimos los enlaces de un usuario a partir de su id
  const id = req.params.id;
  const sqlSelect = "SELECT id_usuario, id_discord, circuitotormenta, twitter FROM `usuarios` WHERE usuarios.id_usuario = ?";

  db.query(sqlSelect, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.post("/", [auth, admin], async (req, res) => {
  // POST /usuarios
  // creamos un usuario
  const { nombre, apellido, nick, edad, rol, contra } = req.body;

  const sql =
    "INSERT INTO `usuarios` (`id_usuario`, `id_equipo`, `id_discord`, `nombre_usuario`, `apellido_usuario`, `nick_usuario`, `edad`, `rol`, `contra`) VALUES (NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [nombre, apellido, nick, edad, rol ?? 0, contra], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/", [auth, self], async (req, res) => {
  // PUT /usuarios
  // modificamos un usuario
  const { id_usuario, columna, valor } = req.body;

  const sql = "UPDATE usuarios SET `" + columna + "` = ? WHERE id_usuario = ?";
  db.query(sql, [valor, id_usuario], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/icono", [auth, admin], async (req, res) => {
  // PUT /usuario/icono
  // cambiamos icono de un usuario a partir de su id
  const { id, icono } = req.body;

  const sql = "UPDATE usuarios SET icono = ? WHERE id_usuario = ?";
  db.query(sql, [icono, id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/enlaces", [auth, self], async (req, res) => {
  // PUT /usuarios/enlaces
  // cambiamos enlace de un usuario
  const { id_usuario, columna, valor } = req.body;

  const sqlComprobar = "SELECT " + columna + " FROM usuarios WHERE " + columna + " = ?";
  const sqlUpdate = "UPDATE usuarios SET " + columna + " = ? WHERE id_usuario = ?";
  db.query(sqlComprobar, [valor], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      if (result.length == 0) {
        db.query(sqlUpdate, [valor, id_usuario], (err2, result2) => {
          if (err2) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err2 });
          } else {
            res.send({ status: 200, success: true, result: result2 });
          }
        });
      } else {
        res.send({ status: 409, success: false, reason: "Esta cuenta ya está enlazada." });
      }
    }
  });
});

router.delete("/", [auth, admin], async (req, res) => {
  // DELETE /usuarios
  // eliminamos un usuario a partir de su id
  id = req.body.id;

  const sqlDeleteLogs = "DELETE FROM logs WHERE id_usuario = ?";
  const sqlDeleteSesiones = "DELETE FROM sesiones WHERE id_usuario = ?";
  const sqlDeleteCuentas = "DELETE FROM cuentas_lol WHERE id_usuario = ?";
  const sqlDeleteUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";

  try {
    db.query(sqlDeleteLogs, [id]);
    db.query(sqlDeleteSesiones, [id]);
    db.query(sqlDeleteCuentas, [id]);
    db.query(sqlDeleteUsuario, [id]);

    res.send({ status: 200, success: true });
  } catch (err) {
    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
  }
});

router.delete("/enlaces", [auth, self], async (req, res) => {
  // DELETE /usuarios/enlaces
  // eliminamos enlace de un usuario
  const { id_usuario, columna } = req.body;

  const sqlDelete = "UPDATE usuarios SET " + columna + " = null WHERE id_usuario = ?";

  db.query(sqlDelete, [id_usuario], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

// Exportamos el router
module.exports = router;
