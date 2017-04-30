'use strict';

module.exports = {};

const uuid = require('uuid');
const error = require('http-errors');
const knex = require('knex');
const db = require('../db');
const friends = require('./friends');


const subscribe = (requestor, target) => {
    return friends
        .findByEmail(target)
        .then(user => {
            if (!user) {
                throw error.NotFound('User '+target+' not found');
            }
            return db('subscriptions').insert({
                id: uuid(),
                target: user.id,
                subscriber: requestor 
            });
        })
        .catch(err => {
            // this approach is less portable but safer than doing a select first.
            if (err.code === '23505') throw error.Conflict('Already subscribed');
            else throw err;
        });
}

const findByTarget = (targetId) => {
    return db('subscriptions')
        .select('target', 'subscriber')
        .where('target', targetId);
}


Object.assign(module.exports, {subscribe, findByTarget});
