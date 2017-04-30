'use strict';

const expect = require('chai').expect;
const error = require('http-errors');
const testApp = require('./test-app');
const app = require('../app');

const api = testApp(app);

const connect = (email1, email2) => {
    const body = {friends: [email1, email2]};
    return new Promise((resolve, reject) => {
        api.post('/friends', {body}, (err, res, body) => {
            if (err) reject(err);
            else if (res.statusCode !== 200) reject(error(res.statusCode));
            else resolve(body);
        });
    });
}

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

describe('Story 3: common friends API', () => {


    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection

    // common friends: common_friend, other_common_friend
    beforeEach(() => 
        Promise.all([
            connect('john@example.com', 'johns_friend@example.com'),
            connect('john@example.com', 'johns_other_friend@example.com'),
            connect('john@example.com', 'common_friend@example.com'),
            connect('john@example.com', 'other_common_friend@example.com'),
            connect('andy@example.com', 'andys_friend@example.com'),
            connect('andy@example.com', 'common_friend@example.com'),
            connect('andy@example.com', 'other_common_friend@example.com')
        ])
    );

    it('should respond 400 if one friend does not exist', done => {
        const body = {
            friends:
            [
              'andy@example.com',
              'jane@example.com'
            ]
        };
        api.post('/friends/common', {body}, (err, res, body) => {
            if (err) return done(err);
            expect(res.statusCode).to.equal(404);
            expect(body.error).to.match(/jane@example.com not found/i);
            done();
        });
    });

    it('should respond 200 and a list of common fiends on success', done => {
        const body = {
            friends:
            [
              'andy@example.com',
              'john@example.com'
            ]
        };
        
        const commonFriends = [
            'common_friend@example.com', 
            'other_common_friend@example.com'
        ];
        const otherFriends = [
            'johns_friend@example.com',
            'johns_other_friend@example.com',
            'andys_friend@example.com'
        ];

        api.post('/friends/common', {body}, (err, res, body) => {
            if (err) return done(err);

            expect(res.statusCode).to.equal(200);
            expect(body.success).to.be.true;
            expect(body.friends.length).to.equal(2);
            expect(body.count).to.equal(2);

            commonFriends.forEach(f => expect(body.friends).to.contain(f));
            otherFriends.forEach(f => expect(body.friends).not.to.contain(f));
            
            done();
        });
    });
});
