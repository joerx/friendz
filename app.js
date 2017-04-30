'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const error = require('http-errors');
const uuid = require('uuid');
const db = require('./lib/db');
const friends = require('./lib/store/friends');
const subscriptions = require('./lib/store/subscriptions');

const app = module.exports = express();

app.use(bodyParser.json());

app.post('/friends', (req, res, next) => {
    const emails = req.body.friends;

    if (!emails) {
        return next(error.BadRequest('Missing friends data'));
    }
    if (emails.length != 2) {
        return next(error.BadRequest('Exactly two emails are required'));
    }

    friends.connect(emails)
        .then(() => res.status(200).json({success: true}))
        .catch(err => next(err));
});

app.post('/friends/list', (req, res, next) => {
    const email = req.body.email;

    friends.list(email)
        .then(friends => {
            res.status(200).json({
                success: true,
                friends: friends.map(f => f.email),
                count: friends.length
            });
        })
        .catch(err => next(err));
});

app.post('/friends/common', (req, res, next) => {
    const emails = req.body.friends;

    friends.findCommon(emails)
        .then(friends => {
            res.status(200).json({
                success: true,
                friends: friends.map(f => f.email),
                count: friends.length
            });
        })
        .catch(err => next(err));
});

app.post('/subscriptions', (req, res, next) => {
    const requestor = req.body.requestor;
    const target = req.body.target;

    if (!req.body.target) {
        return next(error.BadRequest('Target parameter is missing'));
    }
    if (!req.body.requestor) {
        return next(error.BadRequest('Requestor parameter is missing'));
    }

    subscriptions.subscribe(requestor, target)
        .then(() => res.status(200).json({success: true}))
        .catch(err => next(err));
});


// 404 handler. We want a JSON response, so override express' default which renders HTML.
app.use((req, res, next) => {
    next(error.NotFound());
});

// Error handler. Constructs json response from given error objects statusCode and message 
// properties. If no statusCode and/or message are set, generates a generic 500 error.
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message || 'Unknown error';

    if (status >= 500) {
        // try err stack first, some errors don't print stack trace by default
        console.error(err.stack || err);
    }

    res.status(status).json({error: message});
});
