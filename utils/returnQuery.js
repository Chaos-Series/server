const db = require("../middleware/db");

/**
 * Ejecuta una consulta en la base de datos y devuelve el resultado.
 * 
 * @param {string} query - La consulta SQL a ejecutar.
 * @param {Array} params - Los parámetros de la consulta.
 * @param {boolean} sendResponse - Indica si se debe enviar una respuesta al cliente.
 * @returns {Promise} Una promesa que se resuelve con el resultado de la consulta.
 */
async function returnQuery(query, res, params, sendResponse = true) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err && sendResponse) {
        reject(res.send({ status: 500, success: false, reason: "Problema con la base de datos.", error: err }));
      } else if (sendResponse) {
        resolve(res.send({ status: 200, success: true, result: result }));
      } else if (err && !sendResponse) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch(error => {
    // console.log(error);
  });
}

module.exports = {
  returnQuery
};