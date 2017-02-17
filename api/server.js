"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
var app = express();
const ConnectionPool = require("tedious-connection-pool");
const tds = require("./app/utils/tds-promises");
const tedious_1 = require("tedious");
var bodyParser = require('body-parser');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var fs = require('fs');
var env = require('dotenv').load();
var moment = require('moment');
const kegController = require("./app/controllers/kegController");
const personController = require("./app/controllers/personController");
const sessionController = require("./app/controllers/session");
const queryExpression = require("./app/utils/query_expression");
var users = [];
var owner = null;
var config = {
    userName: process.env.SqlUsername,
    password: process.env.SqlPassword,
    server: process.env.SqlServer,
    options: {
        database: process.env.SqlDatabase,
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
};
tds.default.setConnectionPool(new ConnectionPool({}, config));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new BasicStrategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
    var sql = "SELECT client_id, api_key " +
        "FROM SecurityTokens " +
        "WHERE client_id = @clientId and api_key = @apiKey";
    try {
        var results = yield tds.default.sql(sql)
            .parameter('clientId', tedious_1.TYPES.NVarChar, username)
            .parameter('apiKey', tedious_1.TYPES.NVarChar, password)
            .executeImmediate();
        if (!results || results.length != 1) {
            return done(null, false, { message: 'Invalid client_id or api_key' });
        }
        else if (username.valueOf() == results[0].client_id && password.valueOf() == results[0].api_key) {
            return done(null, true);
        }
        return done(null, false, { message: 'Invalid client_id or api_key' });
    }
    catch (ex) {
        done(ex);
    }
})));
var port = process.env.PORT || 8000;
var router = express.Router();
router.use(passport.authenticate('basic', { session: false }), function (req, res, next) {
    console.log('Authenticated the User/App successfully!');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.get('/', function (req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });
});
var stdHandler = (handler) => {
    return (req, res) => {
        handler(req, resp => {
            if (resp.code == 200) {
                return res.json(resp.msg);
            }
            else {
                return res.send(resp.code, resp.msg);
            }
        });
    };
};
router.route('/isPersonValid/:card_id')
    .get(stdHandler((req, resultDispatcher) => personController.getPersonByCardId(req.params.card_id, resultDispatcher)));
router.route('/kegs')
    .get(stdHandler((req, resultDispatcher) => kegController.getKeg(null, resultDispatcher)));
router.route('/activity/:sessionId?')
    .get(stdHandler((req, resultDispatcher) => sessionController.getSessions(req.params.sessionId, new queryExpression.QueryExpression(req.query), resultDispatcher)))
    .post(stdHandler((req, resultDispatcher) => sessionController.postNewSession(req.body, resultDispatcher)));
router.route('/CurrentKeg')
    .get(stdHandler((req, resultDispatcher) => kegController.getCurrentKeg(null, resultDispatcher)));
router.route('/CurrentKeg/:tap_id')
    .get(stdHandler((req, resultDispatcher) => kegController.getCurrentKeg(req.params.tap_id, resultDispatcher)))
    .post(function (req, res) {
});
router.route('/kegFinished/:tap_id')
    .put(function (req, res) {
});
app.use('/api', router);
app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
console.log('Listening on port: ' + port);
module.exports = { app };
//# sourceMappingURL=server.js.map