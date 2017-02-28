require('mocha');
import chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server').app;
chai.use(chaiHttp);
import request = require('request')
var should = chai.should();

var adminBearerToken: String;
var nonAdminBearerToken: string;

function getAccessToken(refreshToken: string, next: (err: any, token: string) => void) {
    // Fetch bearer token using refresh token specified in env vars
    request.post({
        url: `https://login.microsoftonline.com/${process.env.Tenant}/oauth2/token`,
        json: true,
        form: {
            'grant_type': 'refresh_token',
            'client_id': process.env.AdminClientId,
            'client_secret': process.env.AdminClientSecret,
            'resource': process.env.ClientId,
            'refresh_token': refreshToken
        }
    }, (err, response, body) => {
        if (!err && response.statusCode == 200) {
            next(null, body.access_token);
        }
        else {
            next(err || body, null);
        }
    });
}

before((done) => {
    // Fetch bearer token using refresh token specified in env vars
    getAccessToken(process.env.AdminRefreshToken, (err, token) => {
        if (token) {
            adminBearerToken = token;
            getAccessToken(process.env.NonAdminRefreshToken, (err, token) => {
                if (token) {
                    nonAdminBearerToken = token;
                    done();
                }
                else {
                    done(err);
                }
            });
        }
        else {
            done(err);
        }
    })
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

    it('should require bearer token authentication on /api/kegs POST', function(done) {
        chai.request(server)
        .post('/api/kegs')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(401);
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
            res.body.should.have.property('KegId');
            res.body.should.have.property('Name');
            res.body.should.have.property('Brewery');
            res.body.should.have.property('BeerType');
            res.body.should.have.property('ABV');
            res.body.should.have.property('IBU');
            res.body.should.have.property('BeerDescription');
            res.body.should.have.property('UntappdId');
            res.body.should.have.property('imagePath');
            done();
        })
    });

    it('should require bearer token authentication on /api/CurrentKeg/<id> PUT', function(done) {
        chai.request(server)
        .put('/api/CurrentKeg/1')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .send({KegId: 6, KegSize: 17000})
        .end(function(err, res){
            res.should.have.status(401);
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
        .get('/api/activity/1')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('SessionId');
            res.body.should.have.property('PourTime');
            res.body.should.have.property('PourAmount');
            res.body.should.have.property('BeerName');
            res.body.should.have.property('Brewery');
            res.body.should.have.property('BeerType');
            res.body.should.have.property('ABV');
            res.body.should.have.property('IBU');
            res.body.should.have.property('BeerDescription');
            res.body.should.have.property('UntappdId');
            res.body.should.have.property('BeerImagePath');
            res.body.should.have.property('PersonnelNumber');
            res.body.should.have.property('Alias');
            res.body.should.have.property('FullName');
            done();
        })
    });

    it('should get valid specific person on /api/isPersonValid/<id> GET', function(done) {
        chai.request(server)
        .get('/api/isPersonValid/1801958')
        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
        .end(function(err, res){
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
            done();
        })
    });

    it('should 401 on invalid bearer token on /api/users GET', function(done) {
        chai.request(server)
        .get('/api/users')
        .end(function(err, res){
            res.should.have.status(401);
            done();
        })
    });

    it('should return all users for admin request to /api/users GET', function(done) {
        chai.request(server)
        .get('/api/users')
        .set('Authorization', 'Bearer ' + adminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.an('array');
            res.body.should.not.be.empty;
            res.body[0].should.have.property('PersonnelNumber');
            done();
        })
    });

    it('should return user info for bearer token user to /api/users/me GET', function(done) {
        chai.request(server)
        .get('/api/users/me')
        .set('Authorization', 'Bearer ' + adminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.be.equal(Number(process.env.AdminPersonnelNumber));
            done();
        })
    });

    it('should return user info for non-admin bearer token user to /api/users/me GET', function(done) {
        chai.request(server)
        .get('/api/users/me')
        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.be.equal(Number(process.env.NonAdminPersonnelNumber));
            done();
        })
    });

    it('should not find specific invalid user for admin request to /api/users/:user_id GET', function(done) {
        chai.request(server)
        .get('/api/users/blah@microsoft.com')
        .set('Authorization', 'Bearer ' + adminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(404);
            done();
        })
    });

    it('should return specific person that is a user for admin request to /api/users/:user_id GET', function(done) {
        chai.request(server)
        .get('/api/users/jamesbak@microsoft.com')
        .set('Authorization', 'Bearer ' + adminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.PersonnelNumber.should.be.within(420000, 430000);
            should.not.equal(res.body.UntappdAccessToken, null);
            done();
        })
    });

    it('should return specific person that is not a user for admin request to /api/users/:user_id GET', function(done) {
        chai.request(server)
        .get('/api/users/OLIVERH@microsoft.com')
        .set('Authorization', 'Bearer ' + adminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.PersonnelNumber.should.equal(52);
            should.equal(res.body.UntappdAccessToken, undefined);
            done();
        })
    });

    it('should return 400 Bad Request for non-admin request to /api/users/:user_id GET', function(done) {
        chai.request(server)
        .get('/api/users/OLIVERH@microsoft.com')
        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(400);
            done();
        })
    });

    it('should return user identified by access token for non-admin request to /api/users GET', function(done) {
        chai.request(server)
        .get('/api/users')
        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
        .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
            done();
        })
    });

    //TODO:
    // - Test PUT to kegFinished
    // - Test POST to /activity
    // - Test POST to /CurrentKeg

});