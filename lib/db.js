'use strict';

const knex = require('knex');
const config = require('../configure');

let conn = null;

const db = module.exports = (tableName) => {
    if (!conn) conn = knex(config.knex);
    if (tableName) return conn(tableName);
    else return conn;
}

db.disconnect = () => {
    if (conn) conn.destroy();
    conn = null;
}
