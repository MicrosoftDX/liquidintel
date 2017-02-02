var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var passport = require('passport');
var BearerStrategy = require('passport-azure-ad').BearerStrategy;
var fs = require('fs'); //For SSL
var env = require('dotenv').load();
var moment = require('moment');
var keg = require('./app/models/keg.js');
var kegController = require('./app/controllers/kegController.js');
var personController = require('./app/controllers/personController.js');

/* Adding SSL */
/*var securityOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem'),
    requestCert: true
};*

/* Azure AD */
var options = {
  identityMetadata: process.env.AADIdentityMetadata,
  loggingLevel: process.env.AADLoggingLevel,
  clientID: process.env.AADClientID,
  audience: process.env.AADAudience,
  validateIssuer: process.env.AADValidateIssuer,
  passReqToCallback: process.env.AADPassReqToCallback
};
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
        rowCollectionOnRequestCompletion: process.env.SqlRowCollectionOnRequestCompletion
    }
};


var connection = new Connection(config);
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
var bearerStrategy = new BearerStrategy(options, function(token, done){
    return done(null, token);
});

passport.use(bearerStrategy);

/* Setting Port to 8000 */

var port = process.env.PORT || 8000;
var router = express.Router();


router.use(passport.authenticate('oauth-bearer', {session: false}), function(req, res, next) {
    console.log('Authenticated the User/App successfully!');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


router.get('/', function(req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });   
});


router.route('/GetPersonByCardId/:card_id')
    .get(function(req, res) {
        personController.getPersonByCardId(req.params.card_id, connection, function(resp){
            if(resp.code==200)
            {
                return res.json(resp.msg);
            }
            else
            {
                return res.send(resp.code, resp.msg);
            }
        }); 
    });


router.route('/kegs')
    .get(function(req, res){
        kegController.getKeg(null, connection, function(resp){
            if(resp.code==200)
            {
                return res.json(resp.msg);
            }
            else
            {
                return res.send(resp.code, resp.msg);
            }
        }); 
    });


router.route('/CurrentKeg')
    .get(function(req, res){
        kegController.getCurrentKeg(null, connection, function(resp){
            if(resp.code==200)
            {
                return res.json(resp.msg);
            }
            else
            {
                return res.send(resp.code, resp.msg);
            }
        }); 
    });



router.route('/CurrentKeg/:tap_id')
//Get Current Keg for the TapId specified
    .get(function(req, res){
        kegController.getCurrentKeg(req.params.tap_id, connection, function(resp){
            if(resp.code==200)
            {
                return res.json(resp.msg);
            }
            else
            {
                return res.send(resp.code, resp.msg);
            }
        }); 
    })

//Add a new Keg
        .post(function(req, res){
            if(req.body.kegId!=null){
                var checkForKeg = "SELECT Id FROM dbo.DimKeg WHERE Id=@kegId";
                request = new Request(sqlStatement, function(err, rowCount, rows){
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
