'use strict';

const Sequelize = require('sequelize');
const assert = require('assert');

assert(process.env.MYSQL_HOST, 'MYSQL_HOST must be set');
assert(process.env.MYSQL_USER, 'MYSQL_USER must be set');
assert(process.env.MYSQL_DATABASE, 'MYSQL_DATABASE must be set');
assert(process.env.MYSQL_PASSWORD, 'MYSQL_PASSWORD must be set');

const sequelize = module.exports = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD, 
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
    }
});
