const db = require("../middleware/db");
const { returnQuery } = require("./returnQuery");

async function returnMatch(res) {
  try {
    let partidos = await returnQuery(
      "SELECT id_partido, id_liga, id_temporada, id_equipo1, id_equipo2, fecha, arbitros, tipo, jornada, jugadores_blue, jugadores_red, progreso, match_id, match_info, estadisticas_recogidas, enlace_youtube, puntuacion_blue, puntuacion_red FROM partidos WHERE tipo = 0 ORDER BY progreso ASC, fecha ASC",
      res,
      [],
      false
    );
    let equipos = await returnQuery("SELECT * FROM equipos", res, [], false);

    partidos = partidos.filter((info) => {
      let equipoBlue = equipos.find((equipo) => equipo.id_equipo == info.id_equipo1);
      let equipoRed = equipos.find((equipo) => equipo.id_equipo == info.id_equipo2);

      equipoBlue === undefined ? [] : equipoBlue;
      equipoRed === undefined ? [] : equipoRed;

      info.equipos = {};
      info.equipos.equipoBlue = equipoBlue === undefined ? [] : equipoBlue;
      info.equipos.equipoRed = equipoRed === undefined ? [] : equipoRed;

      return info.equipos.length != 0;
    });

    res.send({ status: 200, success: true, result: partidos });
  } catch (error) {
    console.log(error);
    res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: error });
  }
}

module.exports = { returnMatch };
