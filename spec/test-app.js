'use strict';

const request = require('request');
const knex = require('knex');
const http = require('http');
const db = require('../lib/db');

// drop all tables so we have a clean db
const cleanup = (conn) => {
    const tables = ['friends'];
    return Promise.all(tables.map(
        (t) => conn.schema.hasTable(t).then(exists => exists ? conn.truncate(t) : null)
    ));
}

// Creates a test app instance, essentially starting an instance of `app` and returning an 
// instance of `request` module defaulting to the test apps url/port.
const testApp = module.exports = (app) => {

    let server = null;

    // random number between 10000-65000. could lead to port collision, but unlikely
    const port = 10000 + (Math.floor(Math.random()*55000));
    const agent = request.defaults({
        baseUrl: 'http://localhost:'+port,
        json: true
    });

    // extend the defaulted request object with a start method to use in `before` hooks, etc.
    return Object.assign(agent, {
        start: done => {
            cleanup(db())
                .then(() => {
                    server = app.listen(port, done)
                })
                .catch(done);
        },
        stop: () => {
            db.disconnect();
            if (server) server.close();
        }
    });
}
