/// <reference path="typings/index.d.ts" />

import express = require('express');        // call express
var app = express();                 // define our app using express

import tedious = require('tedious');
var bodyParser = require('body-parser');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
//var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var fs = require('fs'); //For SSL
var env = require('dotenv').load();
var moment = require('moment');
import kegController = require('./app/controllers/kegController');
import personController = require('./app/controllers/personController');
import sessionController = require('./app/controllers/session');
import queryExpression = require('./app/utils/query_expression');

/* Adding SSL */
/*var securityOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem'),
    requestCert: true
};*

/* Azure AD */
/*var options = {
  identityMetadata: process.env.AADIdentityMetadata,
  loggingLevel: process.env.AADLoggingLevel,
  clientID: process.env.AADClientID,
  audience: process.env.AADAudience,
  validateIssuer: process.env.AADValidateIssuer,
  passReqToCallback: process.env.AADPassReqToCallback
};*/
/* Azure AD - till here */

// array to hold logged in users and the current logged in user (owner)
var users = [];
var owner = null;

var config = {
    userName: process.env.SqlUsername,
    password: process.env.SqlPassword,
    server: process.env.SqlServer,
    options: {
        database: process.env.SqlDatabase,
        encrypt: true, 
        rowCollectionOnRequestCompletion: true,
        useColumnNames: true
    }
};

var connection = new tedious.Connection(config);
connection.on('connect', function(err){
  if(err)
  {
      console.log('Error while connecting to the DB: '+err);
  }
  else{
      console.log('Connected to SQL DB');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Azure AD */
app.use(passport.initialize());
app.use(passport.session());

/*
/* Calling the OIDCBearerStrategy and managing users
/*
/* Passport pattern provides the need to manage users and info tokens
/* with a FindorCreate() method that must be provided by the implementor.
/* Here we just autoregister any user and implement a FindById().
/* You'll want to do something smarter.
**/
/*var bearerStrategy = new BearerStrategy(options, function(token, done){
    return done(null, token);
});

passport.use(bearerStrategy);
*/

passport.use(new BasicStrategy((username, password, done) => {
    var sql = "SELECT client_id, api_key " +
              "FROM SecurityTokens " +
              "WHERE client_id = @clientId and api_key = @apiKey";
    var request = new tedious.Request(sql, (err, rowCount, rows) => {
        if (err) {
            return done(err);
        }
        else if (rowCount == 0 || rowCount > 1) {
            return done(null, false, {message: 'Invalid client_id or api_key'});
        }
        else if (username.valueOf() == rows[0].client_id.value && password.valueOf() == rows[0].api_key.value) {
            return done(null, true);
        }
        return done(null, false, {message: 'Invalid client_id or api_key'});
    });
    request.addParameter('clientId', tedious.TYPES.NVarChar, username);
    request.addParameter('apiKey', tedious.TYPES.NVarChar, password);
    connection.execSql(request);
}));

/* Setting Port to 8000 */

var port = process.env.PORT || 8000;
var router = express.Router();

router.use(passport.authenticate('basic', {session: false}), function(req, res, next) {
    console.log('Authenticated the User/App successfully!');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });   
});

var stdHandler = (handler: (req:express.Request, resultDispatcher:(resp:any)=>express.Response)=>void) => {
    return (req:express.Request, res:express.Response) => {
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
    .get(stdHandler((req, resultDispatcher) => personController.getPersonByCardId(req.params.card_id, connection, resultDispatcher)));

router.route('/kegs')
    .get(stdHandler((req, resultDispatcher) => kegController.getKeg(null, connection, resultDispatcher)));

router.route('/activity/:sessionId?')
    .get(stdHandler((req, resultDispatcher) => sessionController.getSessions(req.params.sessionId, new queryExpression.QueryExpression(req.query), connection, resultDispatcher)))
    .post(stdHandler((req, resultDispatcher) => sessionController.postNewSession(req.body, connection, resultDispatcher)));

router.route('/CurrentKeg')
    .get(stdHandler((req, resultDispatcher) => kegController.getCurrentKeg(null, connection, resultDispatcher)));

//Get Current Keg for the TapId specified
router.route('/CurrentKeg/:tap_id')
    .get(stdHandler((req, resultDispatcher) => kegController.getCurrentKeg(req.params.tap_id, connection, resultDispatcher)))
//TODO: Add a new Keg
    .post(function(req, res){
            if(req.body.kegId!=null){
                var checkForKeg = "SELECT Id FROM dbo.DimKeg WHERE Id=@kegId";
                var request = new tedious.Request(checkForKeg, function(err, rowCount, rows){
                    if(err){
                        console.log('Internal Error: '+err);
                        return res.send(500, err);
                    }
                    else if(rowCount==0){
                        return res.send(404, "Keg Not Found!");
                    }
                    else{
                        return res.json(rows);
                    }
                });
            }
            else{

            }
        
        connection.execSql(request);
    });

  router.route('/kegFinished/:tap_id')
    .put(function(req, res){

    });

/*
//TODO: Using the isCurrent flag for now. Need to change the query to use PourDateTime instead.
router.route('/timeline')
    .get(function(req, res){
        var sqlStatement = "SELECT a.PourDateTime, b.FullName, d.Name as BeerName FROM dbo.FactDrinkers a INNER JOIN dbo.HC01Person b INNER JOIN dbo.FactKegInstall c INNER JOIN dbo.DimKeg d ON a.EmailName = b.HC01Person and a.TapId = c.TapId";
    });
*/

app.use('/api', router);

app.listen(port);

console.log('Listening on port: ' + port);
