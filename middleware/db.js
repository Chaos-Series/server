const mysql = require("mysql");

const db = mysql.createPool({
    //crear la conexion a la base de datos
    host: "161.97.162.29",
    user: "chao_chaossuperadmin",
    password: "kcuuDPIR@*NUWK7h",
    database: "chao_chaos",
});

module.exports = db;
