'use strict';

const request = require('request');

// Creates a test app instance, essentially starting an instance of `app` and returning an 
// instance of `request` module defaulting to the test apps url/port.
const testApp = module.exports = (app) => {

    // random number between 10000-65000. could lead to port collision, but unlikely
    const port = 10000 + (Math.floor(Math.random()*55000));

    const agent = request.defaults({
        baseUrl: 'http://localhost:'+port,
        json: true
    });

    // extend the defaulted request object with a start method to use in `before` hooks, etc.
    return Object.assign(agent, {
        start: done => app.listen(port, done)
    });
}
