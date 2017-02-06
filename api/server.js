var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var fs = require('fs');
var env = require('dotenv').load();
var moment = require('moment');
var keg = require('./app/models/keg.js');
var kegController = require('./app/controllers/kegController.js');
var personController = require('./app/controllers/personController.js');
var sessionController = require('./app/controllers/session.js');
var users = [];
var owner = null;
var config = {
    userName: process.env.SqlUsername,
    password: process.env.SqlPassword,
    server: process.env.SqlServer,
    options: {
        database: process.env.SqlDatabase,
        encrypt: true,
        rowCollectionOnRequestCompletion: true,
        useColumnNames: true
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
passport.use(new BasicStrategy(function (username, password, done) {
    var request = new Request("SELECT c.client_id, c.api_key FROM dbo.SecurityTokens AS c WHERE c.client_id=@clientId and c.api_key=@apiKey;", function (err, rowCount, rows) {
        if (err) {
            return done(err);
        }
        if (rowCount === 0 || rowCount > 1) {
            return done(null, false, { message: 'Invalid client_id or api_key' });
        }
        if (username.valueOf() === rows[0].client_id.value && password.valueOf() === rows[0].api_key.value)
            return done(null, true);
        return done(null, false, { message: 'Invalid client_id or api_key' });
    });
    request.addParameter('clientId', TYPES.NVarChar, username);
    request.addParameter('apiKey', TYPES.NVarChar, password);
    connection.execSql(request);
}));
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
router.route('/isPersonValid/:card_id')
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