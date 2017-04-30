'use strict';

const assert = require('assert');

assert(process.env.NODE_ENV, 'NODE_ENV must be set');
assert(process.env.PG_URL, 'PG_URL must be set');

module.exports = {
    knex: {
        client: 'postgres',
        connection: process.env.PG_URL
    }
};
