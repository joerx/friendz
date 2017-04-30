'use strict';

const expect = require('chai').expect;
const error = require('http-errors');
const testApp = require('./test-app');
const app = require('../app');

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

describe('Story 4: subscription API', () => {

    const api = testApp(app);

    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection

    beforeEach(done => {
        // create some test data
        const body = {friends: ['andy@example.com', 'john@example.com']};
        api.post('/friends', {body}, (err, res, body) => {
            if (err) done(err);
            else if (res.statusCode !== 200) done(error(res.statusCode));
            else done();
        });
    });

    it('should respond 404 if target does not exist', done => {
        const body = {
            'requestor': 'lisa@example.com',
            'target': 'hans@example.com'
        };
        api.post('/subscriptions', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(body.error).to.match(/hans@example.com not found/i)
            done();
        });
    });

    it('should respond 400 if target is missing', done => {
        const body = {
            'requestor': 'lisa@example.com'
        };
        api.post('/subscriptions', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.error).to.match(/target parameter is missing/i)
            done();
        });
    });

    it('should respond 400 if requestor is missing', done => {
        const body = {
            'target': 'hans@example.com'
        };
        api.post('/subscriptions', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.error).to.match(/requestor parameter is missing/i)
            done();
        });
    });

    it('should respond 200 on success', done => {
        const body = {
            'requestor': 'lisa@example.com',
            'target': 'john@example.com'
        };
        api.post('/subscriptions', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(200);
            expect(body.success).to.be.true;
            done();
        });
    });
});
