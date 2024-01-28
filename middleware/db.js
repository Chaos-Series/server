const mysql = require("mysql");

const db = mysql.createPool({
    //crear la conexion a la base de datos
    host: process.env.DB_HOST,
    user: process.env.DB_USER_PROD,
    password: process.env.DB_PASS_PROD,
    database: process.env.DATABASE_PROD,
});

module.exports = db;