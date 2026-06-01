const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root123',  // ← make sure this matches what you set
  database: 'donation_tracker',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();