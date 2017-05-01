'use strict';

module.exports = {};

const error = require('http-errors');
const friends = require('./store/friends');
const blockList = require('./store/block-list');
const subscriptions = require('./store/subscriptions');

const pushAll = (arr, otherArr) => {
    Array.prototype.push.apply(arr, otherArr);
}

const recipients = (senderEmail, text) => {
    const result = [];

    let senderId = null;
    let blockingUsers = null;

    const mapRecipients = (list => {
        pushAll(result, list
            .filter(f => blockingUsers.indexOf(f.id) < 0)
            .map(item => item.email)
        )
    });

    // get connected friends
    return friends.findByEmail(senderEmail)
        .then(sender => {
            // find sender id
            if (!sender) throw error.NotFound('Unknown user '+senderEmail);
            senderId = sender.id;
        })
        .then(() => {
            // get block list
            return blockList.blocking(senderEmail).then(blocking => {
                blockingUsers = blocking.map(b => b.requestor);
            })
        })
        .then(() => {
            // find friends of sender
            return friends.list(senderEmail).then(mapRecipients);
        })
        .then(() => {
            // find other mentioned users, filter through blocklist
            const mentioned = parseMentions(text);
            return friends.findMultiple(mentioned).then(mapRecipients);
        })
        .then(() => {
            // find subscribers
            return subscriptions.findByTarget(senderId).then(subscribers => {
                pushAll(result, subscribers.map(s => s.subscriber));
            });
        })
        .then(() => result);
}


const parseMentions = (text) => {
    // extremely simplified, any '@' surrounded by non-whitespace is considered a mention
    const re = /([^\s]+@[^\s]+)/ig
    return text.match(re);
}

Object.assign(module.exports, {recipients});
