// server/db/connection.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'maglev.proxy.rlwy.net',
    user: 'root',
    password: 'oMZgUEgxQxFidcLztVrAsBSBAJSlRCdo',
    database: 'railway',
    port: '39245',
});

module.exports = pool.promise();
