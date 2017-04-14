"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var app = express();
const ConnectionPool = require("tedious-connection-pool");
const tds = require("./app/utils/tds-promises");
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
const votingController = require("./app/controllers/votingController");
const adminController = require("./app/controllers/adminController");
const queryExpression = require("./app/utils/query_expression");
const adminUserCache = require("./app/utils/admin_user_cache");
const settings = require("./app/utils/settings_encoder");
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
var basicAuthCreds = JSON.parse(process.env.Basic_Auth_Conn_String);
tds.default.setConnectionPool(new ConnectionPool({}, config));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
passport.use(new BasicStrategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
    try {
        for (var cred in basicAuthCreds) {
            if (username === basicAuthCreds[cred].username && password === basicAuthCreds[cred].key) {
                return done(null, true);
            }
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
    audience: settings.decodeSettingArray(process.env.AADAudience),
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
var port = process.env.PORT || 8080;
var router = express.Router();
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Authorization");
    next();
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
router.get('/', function (req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });
});
router.route('/appConfiguration')
    .get(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => resultDispatcher({
    code: 200,
    msg: {
        UntappdClientId: process.env.UntappdClientId,
        UntappdClientSecret: process.env.UntappdClientSecret
    }
})));
router.route('/isPersonValid/:card_id')
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => personController.getPersonByCardId(req.params.card_id, resultDispatcher)));
router.route('/validpeople/:card_id?')
    .get(basicAuthStrategy(), stdHandler((req, resultDispatcher) => personController.getValidPeople(req.params.card_id, resultDispatcher)));
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
router.route('/votes/:user_id')
    .get(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => votingController.getUserVotes(req.params.user_id, resultDispatcher)))
    .put(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => votingController.putUserVotes(req.params.user_id, req.body, resultDispatcher)));
router.route('/votes_tally')
    .get(bearerOAuthStrategy(false), stdHandler((req, resultDispatcher) => votingController.getVotesTally(resultDispatcher)));
router.route('/admin/AuthorizedGroups')
    .get(bearerOAuthStrategy(true), stdHandler((req, resultDispatcher) => adminController.getAllowedGroups(req.query, resultDispatcher)))
    .put(bearerOAuthStrategy(true), stdHandler((req, resultDispatcher) => adminController.putAllowedGroups(req.body.AuthorizedGroups, req.headers.authorization, resultDispatcher)));
app.use('/api', router);
app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
module.exports = { app };
//# sourceMappingURL=server.js.map