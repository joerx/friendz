'use strict';

const knex = require('knex');
const config = require('../configure');

let conn = null;

module.exports = {
    instance: () => {
        if (!conn) conn = knex(config.knex);
        return conn;
    },
    disconnect: () => {
        if (conn) conn.destroy();
        conn = null;
    }
}
