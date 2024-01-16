const mysql = require("mysql");

const db = mysql.createPool({
  //crear la conexion a la base de datos
  host: "161.97.162.29",
  user: "chao_chaos",
  password: "F-7HMvNMF+B^mv@f",
  database: "chao_chaoss",
});

module.exports = db;
