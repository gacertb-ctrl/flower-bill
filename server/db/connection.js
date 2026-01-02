// server/db/connection.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '15.207.100.11',
    user: 'flower_bill',
    password: '2b4acijjZEcmdwnm',
    database: 'flower_bill',
    port: '3306',
});

module.exports = pool.promise();
