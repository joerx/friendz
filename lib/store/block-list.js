'use strict';

module.exports = {};

const uuid = require('uuid');
const error = require('http-errors');
const db = require('../db');
const friends = require('./friends');


const add = (requestor, target) => {
    return friends
        .findByEmail(requestor)
        .then(user => {
            if (!user) {
                throw error.NotFound('User '+requestor+' not found');
            }
            return db('blocklist').insert({
                id: uuid(),
                target: target,
                requestor: user.id
            });
        })
        .catch(err => {
            // see subscriptions.js - vendor specific, but robust and easier to implement
            if (err.code === '23505') throw error.Conflict('Already blocked');
            else throw err;
        });
}


/**
 * Returns list of users blocking the given target (given as email)
 */
const blocking = (target) => {
    return db('blocklist')
        .select('requestor')
        .where('target', target);
}


const isBlockedBy = (requestor, target) => {
    return db('blocklist as b')
        .count()
        .innerJoin('friends as f', 'b.requestor', 'f.id')
        .where('f.email', requestor).andWhere('b.target', target)
        .then(rows => rows[0].count > 0);
}


Object.assign(module.exports, {add, isBlockedBy, blocking});
