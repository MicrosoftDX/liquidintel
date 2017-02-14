require('mocha');
var chai = require('chai'), should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../server').app;
var dbconn = require('../server').connection;
chai.use(chaiHttp);
import tedious = require('tedious');

before(function(done) {
    //Ensure the database connection is done before starting
    this.timeout(15000);
    console.log("Tests ready to start - server listening");
    dbconn.on('connect', function(err){
        done();
    });
});

describe('testing api', function() {

    it('should return 404 on / GET', function(done) {
        chai.request(server)
        .get('/')
        .end(function(err, res){
            res.should.have.status(404);
            done();
        })
    });

    it('should return 401 when without auth on /api GET', function(done) {
        chai.request(server)
        .get('/api')
        .end(function(err, res){
            res.should.have.status(401);
            done();
        })
    });

    it('should respond with welcome to /api on /api GET', function(done) {
        chai.request(server)
        .get('/api')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.body.should.have.property('message');
            res.body.message.should.equal('Welcome to DX Liquid Intelligence api!');
            done();
        })
    });

    it('should list kegs on /api/kegs GET', function(done) {
        chai.request(server)
        .get('/api/kegs')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('KegId');
            res.body[0].should.have.property('Name');
            res.body[0].should.have.property('Brewery');
            res.body[0].should.have.property('BeerType');
            res.body[0].should.have.property('ABV');
            res.body[0].should.have.property('IBU');
            res.body[0].should.have.property('BeerDescription');
            res.body[0].should.have.property('UntappdId');
            res.body[0].should.have.property('imagePath');
            done();
        })
    });

    it('should list current kegs on /api/CurrentKeg GET', function(done) {
        chai.request(server)
        .get('/api/CurrentKeg')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('KegId');
            res.body[0].should.have.property('Name');
            res.body[0].should.have.property('Brewery');
            res.body[0].should.have.property('BeerType');
            res.body[0].should.have.property('ABV');
            res.body[0].should.have.property('IBU');
            res.body[0].should.have.property('BeerDescription');
            res.body[0].should.have.property('UntappdId');
            res.body[0].should.have.property('imagePath');
            done();
        })
    });

    it('should get first current keg on /api/CurrentKeg/<id> GET', function(done) {
        chai.request(server)
        .get('/api/CurrentKeg/1')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('KegId');
            res.body[0].should.have.property('Name');
            res.body[0].should.have.property('Brewery');
            res.body[0].should.have.property('BeerType');
            res.body[0].should.have.property('ABV');
            res.body[0].should.have.property('IBU');
            res.body[0].should.have.property('BeerDescription');
            res.body[0].should.have.property('UntappdId');
            res.body[0].should.have.property('imagePath');
            should.not.exist(res.body[1]);
            done();
        })
    });

    it('should get all activities on /api/activity GET', function(done) {
        chai.request(server)
        .get('/api/activity')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('SessionId');
            res.body[0].should.have.property('PourTime');
            res.body[0].should.have.property('PourAmount');
            res.body[0].should.have.property('BeerName');
            res.body[0].should.have.property('Brewery');
            res.body[0].should.have.property('BeerType');
            res.body[0].should.have.property('ABV');
            res.body[0].should.have.property('IBU');
            res.body[0].should.have.property('BeerDescription');
            res.body[0].should.have.property('UntappdId');
            res.body[0].should.have.property('BeerImagePath');
            res.body[0].should.have.property('PersonnelNumber');
            res.body[0].should.have.property('Alias');
            res.body[0].should.have.property('FullName');
            //todo: check that first pour time is equal to or earlier than second (descending)
            done();
        })
    });

    it('should get specific activity on /api/activity/<id> GET', function(done) {
        chai.request(server)
        .get('/api/activity/1676')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('SessionId');
            res.body[0].should.have.property('PourTime');
            res.body[0].should.have.property('PourAmount');
            res.body[0].should.have.property('BeerName');
            res.body[0].should.have.property('Brewery');
            res.body[0].should.have.property('BeerType');
            res.body[0].should.have.property('ABV');
            res.body[0].should.have.property('IBU');
            res.body[0].should.have.property('BeerDescription');
            res.body[0].should.have.property('UntappdId');
            res.body[0].should.have.property('BeerImagePath');
            res.body[0].should.have.property('PersonnelNumber');
            res.body[0].should.have.property('Alias');
            res.body[0].should.have.property('FullName');
            should.not.exist(res.body[1]);
            done();
        })
    });

    it('should get valid specific person on /api/isPersonValid/<id> GET', function(done) {
        chai.request(server)
        .get('/api/isPersonValid/1801975')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            if (err){console.log(err)};
            console.log(res);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.should.have.property('Valid');
            res.body.should.have.property('FullName');
            res.body.Valid.should.equals(true);
            done();
        })
    });

    it('should get not valid specific person on /api/isPersonValid/<id> GET', function(done) {
        chai.request(server)
        .get('/api/isPersonValid/1958144')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            if (err){console.log(err)};
            console.log(res);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.should.have.property('Valid');
            res.body.should.have.property('FullName');
            res.body.Valid.should.equals(false);
            done();
        })
    });

    it('should 404 on invalid person on /api/isPersonValid/<id> GET', function(done) {
        chai.request(server)
        .get('/api/isPersonValid/0000000')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(404);
            res.text.should.equal('No person found having CardId: 0000000');
            done();
        })
    });

    //TODO:
    // - Test PUT to kegFinished
    // - Test POST to /activity
    // - Test POST to /CurrentKeg

});