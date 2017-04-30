'use strict';

const expect = require('chai').expect;
const testApp = require('./test-app');
const app = require('../app');

describe('HTTP API', () => {

    const api = testApp(app);

    before(done => api.start(done));

    it('should repond 404 with type json for unknown pages', done => {
        api.get('/foo', (err, res, body) => {
            expect(res.statusCode).to.equal(404);
            expect(res.headers['content-type']).to.match(/json/);
            done();
        });
    });
});
