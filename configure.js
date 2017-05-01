'use strict';

/**
 * Main configuration file. Ensures all required env vars are set and returns a config object for
 * other modules.
 */

const assert = require('assert');

// Fail early if any of these is missing.
assert(process.env.NODE_ENV, 'NODE_ENV must be set');
assert(process.env.PG_URL, 'PG_URL must be set');

module.exports = {
    knex: {
        client: 'postgres',
        connection: process.env.PG_URL,
    }
};
