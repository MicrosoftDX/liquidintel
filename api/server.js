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
const passport = require("passport");
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var bodyParser = require('body-parser');
var fs = require('fs');
var env = require('dotenv').load();
var moment = require('moment');
const kegController = require("./app/controllers/kegController");
const personController = require("./app/controllers/personController");
const sessionController = require("./app/controllers/session");
const queryExpression = require("./app/utils/query_expression");
const adminUserCache = require("./app/utils/admin_user_cache");
require('./app/utils/array_async');
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
var aad_auth_options = {
    identityMetadata: process.env.AADMetadataEndpoint,
    clientID: process.env.ClientId,
    audience: (process.env.AADAudience || "").split(';'),
    validateIssuer: true,
};
passport.use("aad-user", new BearerStrategy(aad_auth_options, (token, done) => __awaiter(this, void 0, void 0, function* () {
    token['is_admin'] = yield adminUserCache.isUserAdmin(token.oid);
    return done(null, token);
})));
passport.use("aad-admin", new BearerStrategy(aad_auth_options, (token, done) => __awaiter(this, void 0, void 0, function* () {
    if (yield adminUserCache.isUserAdmin(token.oid)) {
        token['is_admin'] = true;
        return done(null, token);
    }
    done(null, false);
})));
var basicAuthStrategy = () => passport.authenticate(['basic', 'aad-user'], { session: false });
var bearerOAuthStrategy = (requireAdmin) => passport.authenticate(requireAdmin ? 'aad-admin' : 'aad-user', { session: false });
var port = process.env.PORT || 8000;
var router = express.Router();
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Authorization");
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
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => personController.getPersonByCardId(req.params.card_id, resultDispatcher)));
router.route('/kegs')
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => kegController.getKeg(null, resultDispatcher)))
    .post(bearerOAuthStrategy(true), stdHandler((req, resultDispatcher) => kegController.postNewKeg(req.body, resultDispatcher)));
router.route('/activity/:sessionId?')
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => sessionController.getSessions(req.params.sessionId, new queryExpression.QueryExpression(req.query), resultDispatcher)))
    .post(basicAuthStrategy(), stdHandler((req, resultDispatcher) => sessionController.postNewSession(req.body, resultDispatcher)));
router.route('/CurrentKeg/:tap_id?')
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => kegController.getCurrentKeg(req.params.tap_id, resultDispatcher)))
    .put(bearerOAuthStrategy(true), stdHandler((req, resultDispatcher) => kegController.postPreviouslyInstalledKeg(req.body.KegId, req.params.tap_id, req.body.KegSize, resultDispatcher)));
router.route('/users/:user_id?')
    .get(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => personController.getUserDetails(req.params.user_id, req.user.is_admin, req.user.upn, resultDispatcher)))
    .put(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => personController.postUserDetails(req.params.user_id, req.user.is_admin, req.user.upn, req.body, resultDispatcher)));
app.use('/api', router);
app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
module.exports = { app };
//# sourceMappingURL=server.js.map