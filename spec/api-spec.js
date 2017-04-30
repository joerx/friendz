'use strict';

const assert = require('assert');
const testApp = require('./test-app');
const app = require('../app');

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
