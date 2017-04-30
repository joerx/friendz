'use strict';

const uuid = require('uuid');
const error = require('http-errors');
const knex = require('knex');
const db = require('../db');

/**
 * Find a user by email or create a new one of it does not exist.
 */
const findOrInsert = (email) => {
    const id = uuid();

    // using a raw upsert seems to be the only reliable way to prevent a race condition.
    // bogus 'do update' forces to return all rows, not just the ones actually inserted.
    // this is pgsql specific syntax and thus not portable.
    const qs = 'insert into friends (id, email) values (?, ?) '+
        'on conflict (email) do update set email = excluded.email '+
        'returning id, email';

    return db().raw(qs, [id, email]).then(res => {
        return res.rows[0] || {id, email};
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

const findCommon = (emails) => {
    return Promise.all(emails.map(e => findByEmail(e)))
        .then(results => {
            if (results[0].length == 0) {
                throw error.NotFound(`User ${emails[0]} not found`);
            }
            if (results[1].length == 0) {
                throw error.NotFound(`User ${emails[1]} not found`);
            }
            return db()('friends')
                .select('f2.id', 'f2.email')
                .from('friends as f1')
                .innerJoin('friendships', 'f1.id', 'f1_id')
                .innerJoin('friends as f2', 'f2.id', 'f2_id')
                .groupBy('f2.id', 'f2.email')
                .having(db().raw('count(*) = 2'));
        });
}

module.exports = {connect, list, findCommon};
