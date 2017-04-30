'use strict';

const uuid = require('uuid');
const error = require('http-errors');
const db = require('../db');

/**
 * Find a user by email or create a new one of it does not exist.
 */
const findOrInsert = (email) => {
    const query = db()
        .where('email', email)
        .select('id', 'email')
        .from('friends');

    return query.then(rows => {
        if (rows.length != 0) return rows[0];
        else {
            // const data = {id: uuid(), email: email};
            const data = {id: uuid(), email: email};
            return db()('friends').insert(data).then(() => data);
        }
    });
};

/**
 * Connect two users given as an array of email addresses.
 */
const connect = (emails) => {
    return areConnected(emails)
        .then(areConnected => {
            if (areConnected) throw error.Conflict('Users are already connected');
        })
        .then(() => findOrInsert(emails[0]))
        .then(f1 => findOrInsert(emails[1])
            .then(f2 => db()('friendships').insert([
                    {'f1_id': f1.id, 'f2_id': f2.id},
                    {'f1_id': f2.id, 'f2_id': f1.id},
                ])
            )
        );
};

/**
 * Find a user by email address.
 */
const findByEmail = (email) => {
    return db().select('id', 'email').from('friends').where('email', email);
}

/**
 * Returns true if 2 users given as array are connected. Assumes that if e1 is connected to e2 the 
 * inverse is also true.
 */
const areConnected = (emails) => {
    const f1Email = emails[0];
    const f2Email = emails[1];
    return db().count('f1.id')
        .from('friends as f1')
        .innerJoin('friendships', 'f1.id', 'f1_id')
        .innerJoin('friends as f2', 'f2.id', 'f2_id')
        .where('f1.email', f1Email).andWhere('f2.email', f2Email)
        .then(res => res[0].count > 0);
}

/**
 * List friends of user with given email.
 */
const list = (email) => {
    return findByEmail(email).then(rows => {
        if (rows.length == 0) throw error.NotFound('User not found');
        else return db()
            .select('f2.id', 'f2.email')
            .from('friends as f1')
            .innerJoin('friendships', 'f1.id', 'f1_id')
            .innerJoin('friends as f2', 'f2.id', 'f2_id')
            .where('f1.email', email);
    });
}

module.exports = {connect, list};
