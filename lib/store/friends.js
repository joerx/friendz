'use strict';

const uuid = require('uuid');
const db = require('../db');

const findOrInsert = (email) => {
    const conn = db.instance();
    return conn.select('id').from('friends').then(rows => {
        if (rows.length == 0) return conn('friends').insert({id: uuid(), email});
        else return rows[0];
    });
};

const connect = (emails) => {
    return Promise.all(emails.map(e => findOrInsert(e)));
};

module.exports = {connect};
