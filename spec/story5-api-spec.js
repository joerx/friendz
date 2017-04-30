'use strict';

const expect = require('chai').expect;
const error = require('http-errors');
const testApp = require('./test-app');
const app = require('../app');

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

/*
 * Blocklist API allows an existing user to block an email address from subscribing to them. 
 * Moreover, a blocked person cannot connect as friend to the requestor. The requested must 
 * already exist in the system, the target does not need to be in the database. 
 */
describe('Story 5: blocklist API', () => {

    const api = testApp(app);

    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection


    beforeEach(done => {
        // create test data
        const body = {friends: ['andy@example.com', 'jane@example.com']};
        api.post('/friends', {body}, (err, res, body) => {
            if (err) done(err);
            else if (res.statusCode !== 200) done(error(res.statusCode));
            else done();
        });
    });


    it('should respond 404 if requestor does not exist', done => {
        const body = {
            'requestor': 'lisa@example.com',
            'target': 'hans@example.com'
        };
        api.post('/block', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(body.error).to.match(/lisa@example.com not found/i)
            done();
        });
    });


    it('should respond 400 if target is missing', done => {
        const body = {
            'requestor': 'lisa@example.com'
        };
        api.post('/block', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.error).to.match(/target parameter is missing/i)
            done();
        });
    });


    it('should respond 400 if requestor is missing', done => {
        const body = {
            'target': 'hans@example.constom'
        };
        api.post('/block', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.error).to.match(/requestor parameter is missing/i)
            done();
        });
    });


    it('should respond 200 on success', done => {
        const body = {
            requestor: 'andy@example.com',
            target: 'john@example.com'
        };
        api.post('/block', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(200);
            expect(body.success).to.be.true;
            done();
        });
    });


    it('should not allow a blocked person to add the requestor as friend', done => {
        const blockBody = {
            'requestor': 'andy@example.com',
            'target': 'john@example.com'
        };
        const friendsBody = {
            friends: ['andy@example.com', 'john@example.com']
        };

        api.post('/block', {body: blockBody}, (err, res, body) => {
            if (err) return done(err);
            api.post('/friends', {body: friendsBody}, (err, res, body) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(403);
                expect(body.error).to.match(/is blocked/i);
                done();
            });
        });
    });

    it('should respond 409 if already blocked', done => {
        const body = {
            'requestor': 'andy@example.com',
            'target': 'john@example.com'
        };
        api.post('/block', {body}, (err, res) => {
            if (err) return done(err);
            api.post('/block', {body},(err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(409);
                expect(res.body.error).to.match(/already blocked/i);
                done();
            });
        });
    });

});
