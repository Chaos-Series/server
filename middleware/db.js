const mysql = require("mysql");

const db = mysql.createPool({
    //crear la conexion a la base de datos
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

module.exports = db;