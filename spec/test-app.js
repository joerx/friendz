'use strict';

/**
 * Code in this file is to Prepare the app for API-testing by doing mostly two things:
 * 
 * - Clean up all database tables
 * - Start a new instance of the app listening on a random port
 *
 * Provides a pre-defaulted instance of 'request' with the baseUrl already set to the port 
 * the test app is using.
 *
 * Note that the app needs to be started and stopped before/after each test to clean up the db,
 * free database connections and port bindings.
 */

const request = require('request');
const knex = require('knex');
const http = require('http');
const db = require('../lib/db');

// Empty all tables so we have a clean db. List of tables is hardcoded here, improvement would be
// to read it from the database. Don't drop the DB so we don't need to run migrations each time. 
const cleanup = (conn) => {
    const tables = ['friends', 'friendships', 'blocklist', 'subscriptions'];
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
