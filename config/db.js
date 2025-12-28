const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "fypdb",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;
