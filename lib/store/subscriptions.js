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
        .then(rows => {
            if (rows.length === 0) {
                throw error.NotFound('User '+target+' not found');
            }
            return db('subscriptions').insert({
                id: uuid(),
                target: rows[0].id,
                subscriber: requestor 
            });
        });
}


Object.assign(module.exports, {subscribe});
