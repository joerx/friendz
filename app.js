'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const error = require('http-errors');
const assert = require('assert');

// Ensure NODE_ENV is set explicitly
assert(process.env.NODE_ENV, 'NODE_ENV must be set');

const app = module.exports = express();

app.use(bodyParser.json());

app.post('/connect', (req, res, next) => {
    next(error.NotImplemented());
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
