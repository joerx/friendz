'use strict';

const expect = require('chai').expect;
const testApp = require('./test-app');
const app = require('../app');

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

describe('Story 1: friends API', () => {

    const api = testApp(app);

    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection

    it('should repond 200 and status OK for successful request', done => {
        const body = {
          friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };
        api.post('/friends', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.match(/json/);
            expect(body.success).to.be.true;
            done();
        });
    });

    it('should respond 400 when no array was sent', done => {
        const body = {};
        api.post('/friends', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.success).to.be.undefined;
            expect(body.error).to.match(/missing friends data/i);
            done();
        });
    });

    it('should respond 400 when only one email was address was sent', done => {
        const body = {
            friends:
            [
              'andy@example.com'
            ]
        };
        api.post('/friends', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(400);
            expect(body.error).to.match(/two emails are required/i);
            done();
        });
    });

    it('should allow to add the same address with different friends', done => {
        const firstBody = {
            friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };
        const secondBody = {
            friends:
            [
              'andy@example.com',
              'jane@example.com'
            ]
        }

        api.post('/friends', {body: firstBody}, (err, res, body) => {
            if (err) return done(err);
            api.post('/friends', {body: secondBody}, (err, res, body) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('should respond 409 when the same users are connected already', done => {
        const firstBody = {
            friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };
        const secondBody = {
            friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        }

        api.post('/friends', {body: firstBody}, (err, res, body) => {
            if (err) return done(err);
            api.post('/friends', {body: secondBody}, (err, res, body) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(409); // conflict
                expect(body.error).to.match(/already connected/i);
                done();
            });
        });
    });

});
