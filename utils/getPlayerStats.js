// Importamos middlewares
const db = require("../middleware/db");

// Importamos dependencias
const axios = require("axios");

const RIOT_API = process.env.RIOT_API;

async function getPlayerStats(res, resultInfo) {
  resultInfo.forEach((idPartido) => {
    axios.get("https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_" + idPartido["match_id"] + "?api_key=" + RIOT_API).then(async function (response) {
      riotParticipantList = response.data["info"]["participants"]; //Lista de participantes
      //recogemos el id_usuario a partir del puuid de la cuenta
      response.data["metadata"]["participants"].forEach((puuidUsuario, index) => {
        let sqlSelect = "SELECT id_usuario FROM cuentas_lol WHERE puuid_lol = ?";

        db.query(sqlSelect, [puuidUsuario], (err, result) => {
          if (err) {
            res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err });
          } else {
            if (result.length > 0) {
              // Si existe el usuario en la tabla cuentas_lol

              let id_usuario = result[0]["id_usuario"]; //id_usuario
              let asesinatos = riotParticipantList[index]["kills"]; //asesinatos
              let muertes = riotParticipantList[index]["deaths"]; //muertes
              let asistencias = riotParticipantList[index]["assists"]; //asistencias
              let kp = (riotParticipantList[index]["challenges"]["killParticipation"] * 100).toFixed(2); //kp
              let csmin = (riotParticipantList[index]["totalMinionsKilled"] / (response.data["info"]["gameDuration"] / 60)).toFixed(2); //csmin
              let totalminionskilled = riotParticipantList[index]["totalMinionsKilled"]; //total_minions_killed
              let dmgmin = riotParticipantList[index]["challenges"]["damagePerMinute"].toFixed(2); //dmgmin
              let chaosScore =
                50 +
                parseInt(riotParticipantList[index]["challenges"]["soloKills"]) * 3 +
                parseInt(riotParticipantList[index]["challenges"]["pickKillWithAlly"]) * 2 +
                parseInt(riotParticipantList[index]["assists"]) * 0.5 +
                (parseInt(riotParticipantList[index]["challenges"]["dragonTakedowns"]) +
                  parseInt(riotParticipantList[index]["challenges"]["riftHeraldTakedowns"]) +
                  parseInt(riotParticipantList[index]["challenges"]["baronTakedowns"])) *
                  0.5 +
                (parseInt(riotParticipantList[index]["challenges"]["turretTakedowns"]) + parseInt(riotParticipantList[index]["inhibitorTakedowns"])) * 0.4 -
                parseInt(riotParticipantList[index]["deaths"]) * 3.5 -
                (parseInt(riotParticipantList[index]["turretsLost"]) + parseInt(riotParticipantList[index]["inhibitorsLost"])) * 0.4;
              if (chaosScore > 100) {
                chaosScore = 100;
              } else if (chaosScore < 0) {
                chaosScore = 0;
              } //chaosscore
              let doublekills = riotParticipantList[index]["doubleKills"]; //doublekills
              let triplekills = riotParticipantList[index]["tripleKills"]; //triplekills
              let quadrakills = riotParticipantList[index]["quadraKills"]; //quadrakills
              let pentakills = riotParticipantList[index]["pentaKills"]; //pentakills
              let objetivos_robados = riotParticipantList[index]["objectivesStolen"] + riotParticipantList[index]["objectivesStolenAssists"]; //objetivos_robados
              let torres_destruidas = riotParticipantList[index]["challenges"]["turretTakedowns"]; //torres_destruidas
              let inhibidores_destruidos = riotParticipantList[index]["inhibitorTakedowns"]; //inhibidores_destruidos
              let oromin = riotParticipantList[index]["challenges"]["goldPerMinute"].toFixed(2); //oromin
              let primera_torre = riotParticipantList[index]["challenges"]["firstTurretKilled"]; //primera_torre
              let primera_sangre = riotParticipantList[index]["firstBloodKill"] ? 1 : 0; //primera_sangre
              let vision_score = riotParticipantList[index]["visionScore"]; //vision_score
              let wards_colocados = riotParticipantList[index]["wardsPlaced"]; //wards_colocados
              let wards_destruidos = riotParticipantList[index]["wardsKilled"]; //wards_destruidos
              let placas = riotParticipantList[index]["challenges"]["turretPlatesTaken"]; //placas
              let pings =
                riotParticipantList[index]["allInPings"] + //pings (allInPings + assistMePings + baitPings + basicPings + commandPings + dangerPings + enemyMissingPings + enemyVisionPings + getBackPings + holdPings + needVisionPings +  onMyWayPings + pushPings + visionClearedPings)
                riotParticipantList[index]["assistMePings"] +
                riotParticipantList[index]["baitPings"] +
                riotParticipantList[index]["basicPings"] +
                riotParticipantList[index]["commandPings"] +
                riotParticipantList[index]["dangerPings"] +
                riotParticipantList[index]["enemyMissingPings"] +
                riotParticipantList[index]["enemyVisionPings"] +
                riotParticipantList[index]["getBackPings"] +
                riotParticipantList[index]["holdPings"] +
                riotParticipantList[index]["needVisionPings"] +
                riotParticipantList[index]["onMyWayPings"] +
                riotParticipantList[index]["pushPings"] +
                riotParticipantList[index]["visionClearedPings"];
              let objetivos =
                riotParticipantList[index]["challenges"]["dragonTakedowns"] + //objetivos (dragonTakedowns + riftHeraldTakedowns + baronTakedowns)
                riotParticipantList[index]["challenges"]["riftHeraldTakedowns"] +
                riotParticipantList[index]["challenges"]["baronTakedowns"];
              let partidos_totales = 1; //partidos_totales
              let victorias = riotParticipantList[index]["win"] ? 1 : 0; //victorias

              let sqlSelectUserStats = "SELECT * FROM estadisticas_usuarios WHERE id_usuario = ?";
              db.query(sqlSelectUserStats, [id_usuario], (err2, result2) => {
                if (err) {
                  res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err2 });
                } else {
                  if (result2.length == 0) {
                    // Si no existe el usuario en la tabla estadisticas_usuarios

                    let deathsKDA = muertes;
                    if (deathsKDA == 0) deathsKDA = 1;

                    let kda = parseFloat((asesinatos + asistencias) / deathsKDA).toFixed(2); //kda
                    let sqlInsertUserStats =
                      "INSERT INTO `estadisticas_usuarios` (`id_usuario`, `kda`, `asesinatos`, `muertes`, `asistencias`, `kp`, `csmin`, `total_minions_killed`, `dmgmin`, `chaosscore`, `doublekills`, `triplekills`, `quadrakills`, `pentakills`, `objetivos_robados`, `torres_destruidas`, `inhibidores_destruidos`, `oromin`, `primera_torre`, `primera_sangre`, `vision_score`, `wards_colocados`, `wards_destruidos`, `placas`, `pings`, `objetivos`, `partidos_totales`, `victorias`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    db.query(
                      sqlInsertUserStats,
                      [
                        id_usuario,
                        kda,
                        asesinatos,
                        muertes,
                        asistencias,
                        kp,
                        csmin,
                        totalminionskilled,
                        dmgmin,
                        chaosScore,
                        doublekills,
                        triplekills,
                        quadrakills,
                        pentakills,
                        objetivos_robados,
                        torres_destruidas,
                        inhibidores_destruidos,
                        oromin,
                        primera_torre,
                        primera_sangre,
                        vision_score,
                        wards_colocados,
                        wards_destruidos,
                        placas,
                        pings,
                        objetivos,
                        partidos_totales,
                        victorias,
                      ],
                      (err3, result3) => {
                        if (err3) {
                          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err3 });
                        }
                      }
                    );
                  } else {
                    // Si existe el usuario en la tabla estadisticas_usuarios (Actualizar las tablas existentes)

                    let existingStats = result2[0];
                    let deathsKDA = existingStats.muertes + muertes;
                    if (deathsKDA == 0) deathsKDA = 1;

                    let kda = parseFloat((existingStats.asesinatos + asesinatos + existingStats.asistencias + asistencias) / deathsKDA).toFixed(2);
                    // Actualiza la fila en la tabla con las nuevas estadísticas
                    let sqlUpdateUserStats =
                      "UPDATE estadisticas_usuarios SET kda=?, asesinatos=?, muertes=?, asistencias=?, kp=?, total_minions_killed=?, csmin=?, dmgmin=?, chaosscore=?, doublekills=?, triplekills=?, quadrakills=?, pentakills=?, objetivos_robados=?, torres_destruidas=?, inhibidores_destruidos=?, oromin=?, primera_torre=?, primera_sangre=?, vision_score=?, wards_colocados=?, wards_destruidos=?, placas=?, pings=?, objetivos=?, partidos_totales=?, victorias=? WHERE id_usuario=?";
                    db.query(
                      sqlUpdateUserStats,
                      [
                        kda,
                        (existingStats.asesinatos += parseInt(asesinatos)),
                        (existingStats.muertes += parseInt(muertes)),
                        (existingStats.asistencias += parseInt(asistencias)),
                        ((existingStats.kp + parseInt(kp)) / 2).toFixed(2),
                        ((existingStats.csmin + parseFloat(csmin)) / 2).toFixed(2),
                        existingStats.total_minions_killed + totalminionskilled,
                        ((existingStats.dmgmin + parseFloat(dmgmin)) / 2).toFixed(2),
                        existingStats.chaosscore + parseInt(chaosScore),
                        (existingStats.doublekills += parseInt(doublekills)),
                        (existingStats.triplekills += parseInt(triplekills)),
                        (existingStats.quadrakills += parseInt(quadrakills)),
                        (existingStats.pentakills += parseInt(pentakills)),
                        (existingStats.objetivos_robados += parseInt(objetivos_robados)),
                        (existingStats.torres_destruidas += parseInt(torres_destruidas)),
                        (existingStats.inhibidores_destruidos += parseInt(inhibidores_destruidos)),
                        ((existingStats.oromin + parseFloat(oromin)) / 2).toFixed(2),
                        (existingStats.primera_torre += parseInt(primera_torre)),
                        (existingStats.primera_sangre += parseInt(primera_sangre)),
                        (existingStats.vision_score += parseFloat(vision_score)),
                        (existingStats.wards_colocados += parseInt(wards_colocados)),
                        (existingStats.wards_destruidos += parseInt(wards_destruidos)),
                        (existingStats.placas += parseInt(placas)),
                        existingStats.pings + parseInt(pings),
                        existingStats.objetivos + parseInt(objetivos),
                        (existingStats.partidos_totales += parseInt(partidos_totales)),
                        (existingStats.victorias += parseInt(victorias)),
                        id_usuario,
                      ],
                      (err3, result3) => {
                        if (err3) {
                          res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err3 });
                        }
                      }
                    );
                  }
                }
              });
            }
          }
        });
      });
    });

    let updateGame = "UPDATE partidos SET estadisticas_recogidas=1 WHERE match_id=?";
    db.query(updateGame, [idPartido["match_id"]]);
  });
}

module.exports = { getPlayerStats };
