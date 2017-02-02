var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var passport = require('passport');
var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var fs = require('fs');
var env = require('dotenv').load();
var moment = require('moment');
var keg = require('./app/models/keg.js');
var kegController = require('./app/controllers/kegController.js');
var personController = require('./app/controllers/personController.js');
var options = {
    identityMetadata: process.env.AADIdentityMetadata,
    loggingLevel: process.env.AADLoggingLevel,
    clientID: process.env.AADClientID,
    audience: process.env.AADAudience,
    validateIssuer: process.env.AADValidateIssuer,
    passReqToCallback: process.env.AADPassReqToCallback
};
var users = [];
var owner = null;
var config = {
    userName: process.env.SqlUsername,
    password: process.env.SqlPassword,
    server: process.env.SqlServer,
    options: {
        database: process.env.SqlDatabase,
        encrypt: true,
        rowCollectionOnRequestCompletion: process.env.SqlRowCollectionOnRequestCompletion
    }
};
var connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.log('Error while connecting to the DB: ' + err);
    }
    else {
        console.log('Connected to SQL DB');
    }
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
var bearerStrategy = new BearerStrategy(options, function (token, done) {
    return done(null, token);
});
passport.use(bearerStrategy);
var port = process.env.PORT || 8000;
var router = express.Router();
router.use(passport.authenticate('oauth-bearer', { session: false }), function (req, res, next) {
    console.log('Authenticated the User/App successfully!');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.get('/', function (req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });
});
router.route('/GetPersonByCardId/:card_id')
    .get(function (req, res) {
    personController.getPersonByCardId(req.params.card_id, connection, function (resp) {
        if (resp.code == 200) {
            return res.json(resp.msg);
        }
        else {
            return res.send(resp.code, resp.msg);
        }
    });
});
router.route('/kegs')
    .get(function (req, res) {
    kegController.getKeg(null, connection, function (resp) {
        if (resp.code == 200) {
            return res.json(resp.msg);
        }
        else {
            return res.send(resp.code, resp.msg);
        }
    });
});
router.route('/CurrentKeg')
    .get(function (req, res) {
    kegController.getCurrentKeg(null, connection, function (resp) {
        if (resp.code == 200) {
            return res.json(resp.msg);
        }
        else {
            return res.send(resp.code, resp.msg);
        }
    });
});
router.route('/CurrentKeg/:tap_id')
    .get(function (req, res) {
    kegController.getCurrentKeg(req.params.tap_id, connection, function (resp) {
        if (resp.code == 200) {
            return res.json(resp.msg);
        }
        else {
            return res.send(resp.code, resp.msg);
        }
    });
})
    .post(function (req, res) {
    if (req.body.kegId != null) {
        var checkForKeg = "SELECT Id FROM dbo.DimKeg WHERE Id=@kegId";
        var request = new Request(checkForKeg, function (err, rowCount, rows) {
            if (err) {
                console.log('Internal Error: ' + err);
                return res.send(500, err);
            }
            else if (rowCount == 0) {
                return res.send(404, "Keg Not Found!");
            }
            else {
                return res.json(rows);
            }
        });
    }
    else {
    }
    connection.execSql(request);
});
router.route('/kegFinished/:tap_id')
    .put(function (req, res) {
});
app.use('/api', router);
app.listen(port);
console.log('Listening on port: ' + port);
//# sourceMappingURL=server.js.map