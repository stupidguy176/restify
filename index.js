"use strict";

const restify = require('restify');
const mongoose = require('mongoose');

const UserRouter = require('./src/routes/userRouter.js');
const TodoRouter = require('./src/routes/todoRouter.js');
const AuthenRouter = require('./src/routes/authenRouter.js');

const server = restify.createServer();

const dropUnauthorizedRequest = require('./src/middlewares/dropUnauthorizedRequest');
const unless = require('express-unless');

// routes dont need token put in unless
server.use(dropUnauthorizedRequest.unless({ path: [
    '/api/v1/todos',
    '/api/v1/getToken'
] }));
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());

server.listen(8080, function () {
    // establish connection to mongodb
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost');

    const db = mongoose.connection;
    db.on('error', function (err) {
        process.exit(1);
    });

    db.once('open', function () {
        UserRouter(server);
        TodoRouter(server);
        AuthenRouter(server);
    });

    console.log('%s listening at %s', server.name, server.url);
});