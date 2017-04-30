'use strict';

// const randomPort = () => 

const request = require('request');
const assert = require('assert');
const app = require('../app');

// Creates a test app instance, essentially starting an instance of `app` and returning an 
// instance of `request` module defaulting to the test apps url/port.
const testApp = (app) => {
    // random number between 10000-65000. could lead to port collision but unlikely
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

describe('HTTP API', () => {

    const api = testApp(app);

    before(done => api.start(done));

    it('should repond 404 with type json for unknown pages', done => {
        api.get('/foo', (err, res, body) => {
            assert(res.statusCode === 404, 'Status code should be 404');
            assert(res.headers['content-type'].match(/json/), 'Content type should be json');
            done();
        });
    });

});
