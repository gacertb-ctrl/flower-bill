// server/db/connection.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'mysql-377652b8-gacertb-abf0.g.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_7DMZCGdPbK8WSsWHgRl',
    database: 'defaultdb'
});

module.exports = pool.promise();
