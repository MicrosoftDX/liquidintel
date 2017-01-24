var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;

var config = {
    userName: 'azuresub',
    password: 'P0rsche911',
    server: 'dxliquidintel.database.windows.net',
    options: {
        database: 'dxliquidintel',
        encrypt: true, 
        rowCollectionOnRequestCompletion: true
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

var port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
    console.log('As a future enhancement, we will be authenticating our users before serving the results.');
    next();
});


router.get('/', function(req, res) {
    res.json({ message: 'Welcome to DX Liquid Intelligence api!' });   
});


router.route('/GetPersonByCardId/:card_id')
    .get(function(req, res) {
        var sqlStatement = "SELECT p.[EmailName], p.[FullName] FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber WHERE c.CardKeyNbr = @card_id";
        request = new Request(sqlStatement, function(err, rowCount, rows){
            if(err){
                console.log('Internal Error: '+err);
                return res.send(500, err);
            }
            else if(rowCount==0){
                return res.send(404, "No person found having CardId: "+req.params.card_id);
            }
            else{
                return res.json(rows[0]);
            }
        });
        request.addParameter('card_id', TYPES.Int, req.params.card_id);
        console.log('Finding Person for CardID: '+ req.params.card_id); 
        connection.execSql(request);
    });


app.use('/api', router);

app.listen(port);
console.log('Listening on port: ' + port);
