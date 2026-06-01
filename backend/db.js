const mysql = require('mysql2');

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();