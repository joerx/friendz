'use strict';

const expect = require('chai').expect;
const testApp = require('./test-app');
const app = require('../app');

describe('Story 1: friends API', () => {

    const api = testApp(app);

    before(done => api.start(done));

    it('should repond 200 and status OK for successful request', done => {
        const body = {
          friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };
        api.post('/friends', {body}, (err, res, body) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.match(/json/);
            done();
        });
    });

});
