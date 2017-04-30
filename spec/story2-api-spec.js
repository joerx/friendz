'use strict';

const expect = require('chai').expect;
const testApp = require('./test-app');
const app = require('../app');

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

describe('Story 2: get friend list API', () => {

    const api = testApp(app);

    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection

    // insert test data
    beforeEach(done => {
        const body = {
            friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };

        api.post('/friends', {body}, (err, res, body) => done(err));
    });

    it('should return the list of friends for first person', done => {
        const body = {email: 'andy@example.com'};
        api.post('/friends/list', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(200);
            expect(body.success).to.be.true;
            expect(body.friends.length).to.equal(1);
            expect(body.friends).to.contain('john@example.com');
            expect(body.count).to.equal(1);
            done();
        });
    });

    it('should return the list of friends for second person', done => {
        const body = {email: 'john@example.com'};
        api.post('/friends/list', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(200);
            expect(body.success).to.be.true;
            expect(body.friends.length).to.equal(1);
            expect(body.friends).to.contain('andy@example.com');
            expect(body.count).to.equal(1);
            done();
        });
    });

    it('should respond 404 for a person not in the database', done => {
        const body = {email: 'jane@example.com'};
        api.post('/friends/list', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(body.error).to.match(/user not found/i);
            done();
        });
    });

});
