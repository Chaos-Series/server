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

router.get("/", (req, res) => {
  // /usuarios
  // recibimos todos los usuarios

  const sqlSelect = "SELECT * FROM usuarios";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.get("/jugadores", async (req, res) => {
  const sqlSelect =
    "SELECT id_usuario FROM usuarios WHERE rol = 1 AND nombre_usuario != 'NECESITA MODIFICACIÓN' AND apellido_usuario != 'NECESITA MODIFICACIÓN'";

  try {
    const result = await query(sqlSelect);
    const promises = result.map((jugador) => returnPlayerList(jugador.id_usuario));
    const listaJugadores = await Promise.all(promises);

    res.send({ status: 200, success: true, result: listaJugadores });
  } catch (err) {
    console.log(err);
    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
  }
});

router.get("/id=:id", [auth, viewer], (req, res) => {
  // /usuarios/id=:id
  // recibimos usuario por id
  const id = req.params.id;

  returnPlayer(id, res);
});

router.get("/nombre=:nombre", (req, res) => {
  // /usuarios/nombre=:nombre
  // recibimos usuario por nombre
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

router.get("/nombre=:nombre/contra=:contra", (req, res) => {
  // /usuarios/nombre=:nombre
  // recibimos usuario por nombre
  const nombre = req.params.nombre;
  const contra = req.params.contra;

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

router.get("/equipo/id=:id", [auth, viewer], (req, res) => {
  // /usuarios/equipo/id=:id
  //buscamos equipo de un usuario por su misma id
  const id = req.params.id;

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
  ///usuarios/cuentas/id=:id
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
  // /crearusuario
  // crearmos un usuario
  nombre = req.body.nombre;
  apellido = req.body.apellido;
  nick = req.body.nick;
  edad = req.body.edad;
  rol = req.body.rol ? req.body.rol : 0;

  contra = req.body.contra;

  const sql =
    "INSERT INTO `usuarios` (`id_usuario`, `id_equipo`, `id_discord`, `nombre_usuario`, `apellido_usuario`, `nick_usuario`, `edad`, `rol`, `contra`) VALUES (NULL, NULL, NULL, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [nombre, apellido, nick, edad, rol, contra], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      res.send({ status: 200, success: true, result: result });
    }
  });
});

router.put("/", [auth, self], async (req, res) => {
  // /modificarusuario
  // modificamos un usuario
  id_usuario = req.body.id_usuario;
  columna = req.body.columna;
  valor = req.body.valor;

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
  // /usuario/icono
  // cambiamos icono de un usuario a partir de su id
  id = req.body.id;
  icono = req.body.icono;

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
  // /usuarios/enlaces
  // cambiamos enlace de un usuario
  const id_usuario = req.body.id_usuario;
  const columna = req.body.columna;
  const valor = req.body.valor;

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
  // /borrarusuario
  // eliminamos un usuario a partir de su id
  id = req.body.id;

  const sqlDeleteLogs = "DELETE FROM logs WHERE id_usuario = ?";
  const sqlDeleteSesiones = "DELETE FROM sesiones WHERE id_usuario = ?";
  const sqlDeleteCuentas = "DELETE FROM cuentas_lol WHERE id_usuario = ?";
  const sqlDeleteUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";
  db.query(sqlDeleteLogs, [id], (err, result) => {
    if (err) {
      res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
    } else {
      db.query(sqlDeleteSesiones, [id], (err, result) => {
        if (err) {
          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
        } else {
          db.query(sqlDeleteCuentas, [id], (err, result) => {
            if (err) {
              res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
            } else {
              db.query(sqlDeleteUsuario, [id], (err, result) => {
                if (err) {
                  res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
                } else {
                  res.send({ status: 200, success: true, result: result });
                }
              });
            }
          });
        }
      });
    }
  });
});

router.delete("/enlaces", [auth, self], async (req, res) => {
  // /usuarios/enlaces
  // eliminamos enlace de un usuario
  const id_usuario = req.body.id_usuario;
  const columna = req.body.columna;

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
