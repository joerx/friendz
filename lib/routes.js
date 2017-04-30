'use strict';

const express = require('express');
const error = require('http-errors');
const db = require('./db');
const friends = require('./store/friends');
const subscriptions = require('./store/subscriptions');
const blockList = require('./store/block-list');
const updates = require('./updates');

const router = module.exports = express.Router();


router.post('/friends', (req, res, next) => {
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


router.post('/friends/list', (req, res, next) => {
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


router.post('/friends/common', (req, res, next) => {
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


router.post('/subscriptions', (req, res, next) => {
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


router.post('/block', (req, res, next) => {
    const requestor = req.body.requestor;
    const target = req.body.target;

    if (!req.body.target) {
        return next(error.BadRequest('Target parameter is missing'));
    }
    if (!req.body.requestor) {
        return next(error.BadRequest('Requestor parameter is missing'));
    }

    blockList.add(requestor, target)
        .then(() => res.status(200).json({success: true}))
        .catch(err => next(err));
});


router.post('/updates', (req, res, next) => {
    const text = req.body.text;
    const sender = req.body.sender;

    if (!text) {
        return next(error.BadRequest('Update text is missing'));
    }
    if (!sender) {
        return next(error.BadRequest('Sender is missing'));
    }

    updates.recipients(sender, text)
        .then(recipients => {
            res.status(200).json({
                success: true,
                recipients: recipients
            })
        })
        .catch(err => next(err));
});
