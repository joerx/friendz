'use strict';

const knex = require('knex');
const config = require('../configure');

let conn = null;

const db = module.exports = () => {
    if (!conn) conn = knex(config.knex);
    return conn;
}

db.disconnect = () => {
    if (conn) conn.destroy();
    conn = null;
}
