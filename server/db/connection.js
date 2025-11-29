// server/db/connection.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'fm_bill_copy'
});

module.exports = pool.promise();
