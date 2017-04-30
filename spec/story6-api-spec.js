'use strict';

const expect = require('chai').expect;
const error = require('http-errors');
const testApp = require('./test-app');
const app = require('../app');

/*
 * Just some exemplary API tests for each story. Tests aren't complete and don't cover every 
 * scenario, they are mostly here to demonstrate my approach. 
 */

const api = testApp(app);

// helper functions
const resolvePromise = (resolve, reject) => (err, res) => {
    if (err) reject(err);
    else if (res.statusCode != 200) reject(error(res.statusCode, res.body.error));
    else resolve(res.body);
}

const connectUsers = (friends) => {
    return new Promise((resolve, reject) => {
        api.post('/friends', {body: {friends}}, resolvePromise(resolve, reject));
    });
}

const subscribeUser = (subscriber, target) => {
    const body = {
        requestor: subscriber,
        target: target
    };
    return new Promise((resolve, reject) => {
        api.post('/subscriptions', {body}, resolvePromise(resolve, reject));
    });
}

const blockUser = (requestor, target) => {
    const body = {requestor, target};
    return new Promise((resolve, reject) => {
        api.post('/block', {body}, resolvePromise(resolve, reject));
    });
}

/*
 * Update API responds with a list of email address eligible for updates for a given post. 
 * 
 * User john is eligible for updates from user andy:
 *
 * - john has not blocked updates by andy
 * - john has a friend connection with andy
 * - or john has subscribed to updates from andy
 * - or john has been mentioned in the update
 */
describe('Story 6: update API', () => {

    beforeEach(done => api.start(done));
    afterEach(() => api.stop()); // release the port and destroy the db connection

    beforeEach(() => 
        Promise.all([
            connectUsers(['andy@example.com', 'john@example.com']),
            connectUsers(['sue@example.com', 'john@example.com'])
        ]).then(() => {
            subscribeUser('jane@example.com', 'andy@example.com')
        })
    );


    it('should respond 404 if sender does not exist', done => {
        const body = {
            sender: 'someone@example.com',
            text: 'Hello world!'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(404);
            expect(res.body.error).to.match(/unknown user/i)
            done();
        });
    });


    it('should respond 400 if message text is missing', done => {
        const body = {
            sender: 'someone@example.com',
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.error).to.match(/update text is missing/i)
            done();
        });
    });


    it('should respond 400 if sender is missing', done => {
        const body = {
            text: 'Hello world!'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(400);
            expect(res.body.error).to.match(/sender is missing/i)
            done();
        });
    });


    it('should include connected friends in the update', done => {
        // user john is a friend of andy
        // andy posts an update, john is included in the list 
        const body = {
            sender: 'andy@example.com',
            text: 'Hello world!'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(200);
            expect(res.body.recipients).to.contain('john@example.com');
            done();
        });
    });


    it('should include subscribers in the update', done => {
        // user jane has subscribed to andy
        // andy posts an update, jane is included in the list
        const body = {
            sender: 'andy@example.com',
            text: 'Hello world!'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(200);
            expect(res.body.recipients).to.contain('jane@example.com');
            done();
        });
    });


    it('should include mentioned users in the update', done => {
        // user sue@example.org has been mentioned in an update by andy
        // she will receive an email if she is in the database
        const body = {
            sender: 'andy@example.com',
            text: 'Hello sue@example.com'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(200);
            expect(res.body.recipients).to.contain('sue@example.com');
            done();
        });
    });


    it('should ingore mentioned that are not known users', done => {
        // user donald@example.org has been mentioned in an update by andy
        // he will not receive an email as he is not in the database
        const body = {
            sender: 'andy@example.com',
            text: 'Hello donald@example.com'
        };
        api.post('/updates', {body}, (err, res) => {
            if (err) done(err);
            expect(res.statusCode).to.equal(200);
            expect(res.body.recipients).not.to.contain('donald@example.com');
            done();
        });
    });


    it('should not include users that have blocked the sender', done => {
        // user john is still a friend of andy, however, he has blocked updates from andy
        // andy posts an update, john is not included in the list 
        const body = {
            sender: 'andy@example.com',
            text: 'Hello world!'
        };
        blockUser('john@example.com', 'andy@example.com')
            .then(() => {
                api.post('/updates', {body}, (err, res) => {
                    if (err) done(err);
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.recipients).to.contain('jane@example.com');
                    expect(res.body.recipients).not.to.contain('john@example.com');
                    done();
                });
            })
            .catch(done);
    });


    it('should not include mentioned users that have blocked the sender', done => {
        // user sue is still mentioned, however, she has blocked updates from andy
        // andy posts an update, sue is not included in the list 
        const body = {
            sender: 'andy@example.com',
            text: 'Hello sue@example.com'
        };
        blockUser('sue@example.com', 'andy@example.com')
            .then(() => {
                api.post('/updates', {body}, (err, res) => {
                    if (err) done(err);
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.recipients).not.to.contain('sue@example.com');
                    done();
                });
            })
            .catch(done);
    });


});
