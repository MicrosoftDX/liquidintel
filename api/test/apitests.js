"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('mocha');
const chai = require("chai");
var chaiHttp = require('chai-http');
var server = require('../server').app;
chai.use(chaiHttp);
const request = require("request");
var should = chai.should();
var adminBearerToken;
var nonAdminBearerToken;
var newKegId;
function getAccessToken(refreshToken, next) {
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
        if (err) {
            next(err, null, null);
        }
        else if (response.statusCode >= 400) {
            next(null, body, null);
        }
        else {
            next(null, null, body.access_token);
        }
    });
}
describe('testing api', function () {
    this.timeout(7000);
    before(done => {
        getAccessToken(process.env.AdminRefreshToken, (err, errorResponse, token) => {
            if (token) {
                adminBearerToken = token;
                getAccessToken(process.env.NonAdminRefreshToken, (err, errorResponse, token) => {
                    if (token) {
                        nonAdminBearerToken = token;
                        done();
                    }
                    else {
                        done(err || new Error(JSON.stringify(errorResponse)));
                    }
                });
            }
            else {
                done(err || new Error(JSON.stringify(errorResponse)));
            }
        });
    });
    it('should return 404 on / GET', function (done) {
        chai.request(server)
            .get('/')
            .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it('should respond with welcome to /api on /api GET', function (done) {
        chai.request(server)
            .get('/api')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('message');
            res.body.message.should.equal('Welcome to DX Liquid Intelligence api!');
            done();
        });
    });
    it('should list kegs on /api/kegs GET', function (done) {
        chai.request(server)
            .get('/api/kegs')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
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
        });
    });
    it('should list kegs with bearer token on /api/kegs GET', function (done) {
        chai.request(server)
            .get('/api/kegs')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            done();
        });
    });
    describe('Install new keg, mount it on a tap, run activity & validate that the keg volume has dropped', () => {
        describe('Step 1: Install new keg', () => {
            it('should require bearer token authentication on /api/kegs POST', function (done) {
                chai.request(server)
                    .post('/api/kegs')
                    .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                    .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
            it('should require admin bearer token authentication on /api/kegs POST', function (done) {
                chai.request(server)
                    .post('/api/kegs')
                    .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                    .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
            it('should add new keg with all attributes explicitly specified on /api/kegs POST', function (done) {
                chai.request(server)
                    .post('/api/kegs')
                    .set('Authorization', 'Bearer ' + adminBearerToken)
                    .send({
                    Name: 'test beer',
                    Brewery: 'test brewery',
                    BeerType: 'IPA',
                    ABV: 10.5,
                    IBU: 89,
                    BeerDescription: 'This is a really nice, hoppy beer!',
                    UntappdId: 12645
                })
                    .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.Name.should.equal('test beer');
                    res.body.Brewery.should.equal('test brewery');
                    res.body.BeerType.should.equal('IPA');
                    res.body.ABV.should.equal(10.5);
                    res.body.IBU.should.equal(89);
                    res.body.BeerDescription.should.not.be.empty;
                    newKegId = res.body.KegId;
                    done();
                });
            });
            it('should list current kegs on /api/CurrentKeg GET', function (done) {
                chai.request(server)
                    .get('/api/CurrentKeg')
                    .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                    .end((err, res) => {
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
                });
            });
            it('should get first current keg on /api/CurrentKeg/<id> GET', function (done) {
                chai.request(server)
                    .get('/api/CurrentKeg/1')
                    .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                    .end((err, res) => {
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
                });
            });
            describe('Step 2: Mount keg on tap', () => {
                it('should require bearer token authentication on /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                        .send({ KegId: 6, KegSize: 17000 })
                        .end((err, res) => {
                        res.should.have.status(401);
                        done();
                    });
                });
                it('should require admin bearer token authentication on /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                        .send({ KegId: 6, KegSize: 17000 })
                        .end((err, res) => {
                        res.should.have.status(401);
                        done();
                    });
                });
                it('should make previously installed keg current /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .set('Authorization', 'Bearer ' + adminBearerToken)
                        .send({
                        KegId: newKegId,
                        KegSize: 17000
                    })
                        .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.TapId.should.equal(1);
                        res.body.KegId.should.equal(newKegId);
                        res.body.KegSize.should.equal(17000);
                        res.body.CurrentVolume.should.equal(17000);
                        res.body.Name.should.equal('test beer');
                        res.body.Brewery.should.equal('test brewery');
                        res.body.BeerType.should.equal('IPA');
                        res.body.ABV.should.equal(10.5);
                        res.body.IBU.should.equal(89);
                        res.body.BeerDescription.should.not.be.empty;
                        done();
                    });
                });
                describe('Step 3: Generate activity on new keg', () => {
                    it('should get all activities on /api/activity GET', function (done) {
                        chai.request(server)
                            .get('/api/activity')
                            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                            .end((err, res) => {
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
                            done();
                        });
                    });
                    it('should get specific activity on /api/activity/<id> GET', function (done) {
                        chai.request(server)
                            .get('/api/activity/1')
                            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                            .end((err, res) => {
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
                        });
                    });
                    it('should add new activity on /api/activity POST', function (done) {
                        chai.request(server)
                            .post('/api/activity')
                            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                            .send({
                            sessionTime: new Date().toISOString(),
                            personnelNumber: Number(process.env.NonAdminPersonnelNumber),
                            Taps: {
                                "1": {
                                    amount: 155
                                },
                                "2": {
                                    amount: 210
                                }
                            }
                        })
                            .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.an('array');
                            res.body.length.should.equal(2);
                            var tapOne = res.body.find(activity => activity.TapId == 1);
                            var tapTwo = res.body.find(activity => activity.TapId == 2);
                            should.not.equal(tapOne, null);
                            tapOne.should.have.property('ActivityId');
                            tapOne.should.have.property('KegId');
                            tapOne.amount.should.equal(155);
                            should.not.equal(tapTwo, null);
                            tapTwo.amount.should.equal(210);
                            done();
                        });
                    });
                    it('should add new activity but not for empty taps on /api/activity POST', function (done) {
                        chai.request(server)
                            .post('/api/activity')
                            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                            .send({
                            sessionTime: new Date().toISOString(),
                            personnelNumber: Number(process.env.NonAdminPersonnelNumber),
                            Taps: {
                                "1": {
                                    amount: 0
                                },
                                "2": {
                                    amount: 210
                                }
                            }
                        })
                            .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.an('array');
                            res.body.length.should.equal(1);
                            res.body[0].amount.should.equal(210);
                            done();
                        });
                    });
                    describe('Step 4: Validate that activity has reduced volume in keg', () => {
                        it('should have reduced keg volumne after activity /api/CurrentKeg GET', function (done) {
                            chai.request(server)
                                .get('/api/CurrentKeg/1')
                                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                                .end((err, res) => {
                                res.should.have.status(200);
                                res.body.KegSize.should.equal(17000);
                                res.body.CurrentVolume.should.equal(17000 - 155);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    it('should get valid specific person on /api/isPersonValid/<id> GET', function (done) {
        chai.request(server)
            .get('/api/isPersonValid/1801958')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.should.have.property('Valid');
            res.body.should.have.property('FullName');
            res.body.Valid.should.equals(true);
            done();
        });
    });
    it('should get not valid specific person on /api/isPersonValid/<id> GET', function (done) {
        chai.request(server)
            .get('/api/isPersonValid/1958144')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.should.have.property('Valid');
            res.body.should.have.property('FullName');
            res.body.Valid.should.equals(false);
            done();
        });
    });
    it('should 404 on invalid person on /api/isPersonValid/<id> GET', function (done) {
        chai.request(server)
            .get('/api/isPersonValid/0000000')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it('should return an array of valid users on /api/validpeople GET', function (done) {
        this.timeout(60000);
        chai.request(server)
            .get('/api/validpeople')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.an('array');
            res.body.should.not.be.empty;
            res.body[0].should.have.property('PersonnelNumber');
            res.body[0].should.have.property('Valid');
            res.body[0].should.have.property('FullName');
            res.body[0].should.have.property('CardId');
            res.body[0].Valid.should.equal(true);
            done();
        });
    });
    it('should 401 on invalid bearer token on /api/users GET', function (done) {
        chai.request(server)
            .get('/api/users')
            .end((err, res) => {
            res.should.have.status(401);
            done();
        });
    });
    it('should return all users for admin request to /api/users GET', function (done) {
        chai.request(server)
            .get('/api/users')
            .set('Authorization', 'Bearer ' + adminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.an('array');
            res.body.should.not.be.empty;
            res.body[0].should.have.property('PersonnelNumber');
            done();
        });
    });
    it('should return user info for bearer token user to /api/users/me GET', function (done) {
        chai.request(server)
            .get('/api/users/me')
            .set('Authorization', 'Bearer ' + adminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.be.equal(Number(process.env.AdminPersonnelNumber));
            done();
        });
    });
    it('should return user info for non-admin bearer token user to /api/users/me GET', function (done) {
        chai.request(server)
            .get('/api/users/me')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.be.equal(Number(process.env.NonAdminPersonnelNumber));
            done();
        });
    });
    it('should not find specific invalid user for admin request to /api/users/:user_id GET', function (done) {
        chai.request(server)
            .get('/api/users/blah@microsoft.com')
            .set('Authorization', 'Bearer ' + adminBearerToken)
            .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it('should return specific person that is a user for admin request to /api/users/:user_id GET', function (done) {
        chai.request(server)
            .get('/api/users/jamesbak@microsoft.com')
            .set('Authorization', 'Bearer ' + adminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.PersonnelNumber.should.be.within(420000, 430000);
            should.not.equal(res.body.UntappdAccessToken, null);
            done();
        });
    });
    it('should return specific person that is not a user for admin request to /api/users/:user_id GET', function (done) {
        chai.request(server)
            .get('/api/users/OLIVERH@microsoft.com')
            .set('Authorization', 'Bearer ' + adminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.PersonnelNumber.should.equal(52);
            should.equal(res.body.UntappdAccessToken, null);
            done();
        });
    });
    it('should return 400 Bad Request for non-admin request to /api/users/:user_id GET', function (done) {
        chai.request(server)
            .get('/api/users/OLIVERH@microsoft.com')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
    it('should return user identified by access token for non-admin request to /api/users GET', function (done) {
        chai.request(server)
            .get('/api/users')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
            done();
        });
    });
    it('should update own user information /api/users/me PUT', function (done) {
        chai.request(server)
            .put('/api/users/me')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .send({
            PersonnelNumber: Number(process.env.NonAdminPersonnelNumber),
            UntappdUserName: 'test_user',
            UntappdAccessToken: '123456',
            CheckinFacebook: true,
            CheckinTwitter: false,
            CheckinFoursquare: true
        })
            .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
            res.body.UntappdUserName.should.equal('test_user');
            res.body.CheckinFacebook.should.equal(true);
            res.body.CheckinTwitter.should.equal(false);
            res.body.CheckinFoursquare.should.equal(true);
            done();
        });
    });
    it('should update own user information /api/users PUT', function (done) {
        chai.request(server)
            .put('/api/users')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .send({
            PersonnelNumber: Number(process.env.NonAdminPersonnelNumber),
            UntappdUserName: 'test_user',
            UntappdAccessToken: '123456',
            CheckinFacebook: true,
            CheckinTwitter: false,
            CheckinFoursquare: true
        })
            .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
            res.body.UntappdUserName.should.equal('test_user');
            done();
        });
    });
    it('should return 400 Bad Request when update different user information for non-admin call /api/users/user_id PUT', function (done) {
        chai.request(server)
            .put('/api/users/blah@microsoft.com')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .send({
            PersonnelNumber: Number(process.env.NonAdminPersonnelNumber),
            UntappdUserName: 'test_user',
            UntappdAccessToken: '123456',
            CheckinFacebook: true,
            CheckinTwitter: false,
            CheckinFoursquare: true
        })
            .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
    it('should return 400 Bad Request when UserPrincipalName in body doesnt match resource in path /api/users/user_id PUT', function (done) {
        chai.request(server)
            .put('/api/users/me')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .send({
            PersonnelNumber: Number(process.env.NonAdminPersonnelNumber),
            UserPrincipalName: 'blah@microsoft.com',
            UntappdUserName: 'test_user',
            UntappdAccessToken: '123456',
            CheckinFacebook: true,
            CheckinTwitter: false,
            CheckinFoursquare: true
        })
            .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUMvQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUM1QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NEJBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQ2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxD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QUFFLEdBQXNCO1lBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsbUhBQW1ILEVBQUUsVUFBUyxJQUFJO1FBQ2pJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ25CLEdBQUcsQ0FBQyxlQUFlLENBQUM7YUFDcEIsR0FBRyxDQUFDLGVBQWUsRUFBRSxTQUFTLEdBQUcsbUJBQW1CLENBQUM7YUFDckQsSUFBSSxDQUFDO1lBQ0YsZUFBZSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDO1lBQzVELGlCQUFpQixFQUFFLG9CQUFvQjtZQUN2QyxlQUFlLEVBQUUsV0FBVztZQUM1QixrQkFBa0IsRUFBRSxRQUFRO1lBQzVCLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGlCQUFpQixFQUFFLElBQUk7U0FDMUIsQ0FBQzthQUNELEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxHQUFzQjtZQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFDO0FBS1AsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC9hcGl0ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoJ21vY2hhJyk7XHJcbmltcG9ydCBjaGFpID0gcmVxdWlyZSgnY2hhaScpO1xyXG52YXIgY2hhaUh0dHAgPSByZXF1aXJlKCdjaGFpLWh0dHAnKTtcclxudmFyIHNlcnZlciA9IHJlcXVpcmUoJy4uL3NlcnZlcicpLmFwcDtcclxuY2hhaS51c2UoY2hhaUh0dHApO1xyXG5pbXBvcnQgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKVxyXG52YXIgc2hvdWxkID0gY2hhaS5zaG91bGQoKTtcclxuXHJcbnZhciBhZG1pbkJlYXJlclRva2VuOiBTdHJpbmc7XHJcbnZhciBub25BZG1pbkJlYXJlclRva2VuOiBzdHJpbmc7XHJcbnZhciBuZXdLZWdJZDogbnVtYmVyO1xyXG5cclxuZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4ocmVmcmVzaFRva2VuOiBzdHJpbmcsIG5leHQ6IChlcnI6IEVycm9yLCBlcnJvclJlc3BvbnNlOiBhbnksIHRva2VuOiBzdHJpbmcpID0+IHZvaWQpIHtcclxuICAgIC8vIEZldGNoIGJlYXJlciB0b2tlbiB1c2luZyByZWZyZXNoIHRva2VuIHNwZWNpZmllZCBpbiBlbnYgdmFyc1xyXG4gICAgcmVxdWVzdC5wb3N0KHtcclxuICAgICAgICB1cmw6IGBodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vJHtwcm9jZXNzLmVudi5UZW5hbnR9L29hdXRoMi90b2tlbmAsXHJcbiAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICBmb3JtOiB7XHJcbiAgICAgICAgICAgICdncmFudF90eXBlJzogJ3JlZnJlc2hfdG9rZW4nLFxyXG4gICAgICAgICAgICAnY2xpZW50X2lkJzogcHJvY2Vzcy5lbnYuQWRtaW5DbGllbnRJZCxcclxuICAgICAgICAgICAgJ2NsaWVudF9zZWNyZXQnOiBwcm9jZXNzLmVudi5BZG1pbkNsaWVudFNlY3JldCxcclxuICAgICAgICAgICAgJ3Jlc291cmNlJzogcHJvY2Vzcy5lbnYuQ2xpZW50SWQsXHJcbiAgICAgICAgICAgICdyZWZyZXNoX3Rva2VuJzogcmVmcmVzaFRva2VuXHJcbiAgICAgICAgfVxyXG4gICAgfSwgKGVyciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgIG5leHQoZXJyLCBudWxsLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSA0MDApIHtcclxuICAgICAgICAgICAgbmV4dChudWxsLCBib2R5LCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHQobnVsbCwgbnVsbCwgYm9keS5hY2Nlc3NfdG9rZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5kZXNjcmliZSgndGVzdGluZyBhcGknLCBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudGltZW91dCg3MDAwKTtcclxuXHJcbiAgICBiZWZvcmUoZG9uZSA9PiB7XHJcbiAgICAgICAgLy8gRmV0Y2ggYmVhcmVyIHRva2VuIHVzaW5nIHJlZnJlc2ggdG9rZW4gc3BlY2lmaWVkIGluIGVudiB2YXJzXHJcbiAgICAgICAgZ2V0QWNjZXNzVG9rZW4ocHJvY2Vzcy5lbnYuQWRtaW5SZWZyZXNoVG9rZW4sIChlcnIsIGVycm9yUmVzcG9uc2UsIHRva2VuKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgYWRtaW5CZWFyZXJUb2tlbiA9IHRva2VuO1xyXG4gICAgICAgICAgICAgICAgZ2V0QWNjZXNzVG9rZW4ocHJvY2Vzcy5lbnYuTm9uQWRtaW5SZWZyZXNoVG9rZW4sIChlcnIsIGVycm9yUmVzcG9uc2UsIHRva2VuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vbkFkbWluQmVhcmVyVG9rZW4gPSB0b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZShlcnIgfHwgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGVycm9yUmVzcG9uc2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb25lKGVyciB8fCBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoZXJyb3JSZXNwb25zZSkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiA0MDQgb24gLyBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvJylcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwNCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXNwb25kIHdpdGggd2VsY29tZSB0byAvYXBpIG9uIC9hcGkgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaScpXHJcbiAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ21lc3NhZ2UnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkubWVzc2FnZS5zaG91bGQuZXF1YWwoJ1dlbGNvbWUgdG8gRFggTGlxdWlkIEludGVsbGlnZW5jZSBhcGkhJyk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBsaXN0IGtlZ3Mgb24gL2FwaS9rZWdzIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkva2VncycpXHJcbiAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0tlZ0lkJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdOYW1lJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCcmV3ZXJ5Jyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyVHlwZScpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQUJWJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdJQlUnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJEZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVW50YXBwZElkJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdpbWFnZVBhdGgnKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGxpc3Qga2VncyB3aXRoIGJlYXJlciB0b2tlbiBvbiAvYXBpL2tlZ3MgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9rZWdzJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ0luc3RhbGwgbmV3IGtlZywgbW91bnQgaXQgb24gYSB0YXAsIHJ1biBhY3Rpdml0eSAmIHZhbGlkYXRlIHRoYXQgdGhlIGtlZyB2b2x1bWUgaGFzIGRyb3BwZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgZGVzY3JpYmUoJ1N0ZXAgMTogSW5zdGFsbCBuZXcga2VnJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkva2VncyBQT1NUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5wb3N0KCcvYXBpL2tlZ3MnKVxyXG4gICAgICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYWRtaW4gYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkva2VncyBQT1NUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5wb3N0KCcvYXBpL2tlZ3MnKVxyXG4gICAgICAgICAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAxKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdzaG91bGQgYWRkIG5ldyBrZWcgd2l0aCBhbGwgYXR0cmlidXRlcyBleHBsaWNpdGx5IHNwZWNpZmllZCBvbiAvYXBpL2tlZ3MgUE9TVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAucG9zdCgnL2FwaS9rZWdzJylcclxuICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBhZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgLnNlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgIE5hbWU6ICd0ZXN0IGJlZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIEJyZXdlcnk6ICd0ZXN0IGJyZXdlcnknLFxyXG4gICAgICAgICAgICAgICAgICAgIEJlZXJUeXBlOiAnSVBBJyxcclxuICAgICAgICAgICAgICAgICAgICBBQlY6IDEwLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgSUJVOiA4OSxcclxuICAgICAgICAgICAgICAgICAgICBCZWVyRGVzY3JpcHRpb246ICdUaGlzIGlzIGEgcmVhbGx5IG5pY2UsIGhvcHB5IGJlZXIhJyxcclxuICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDEyNjQ1XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ29iamVjdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lk5hbWUuc2hvdWxkLmVxdWFsKCd0ZXN0IGJlZXInKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5CcmV3ZXJ5LnNob3VsZC5lcXVhbCgndGVzdCBicmV3ZXJ5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQmVlclR5cGUuc2hvdWxkLmVxdWFsKCdJUEEnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5BQlYuc2hvdWxkLmVxdWFsKDEwLjUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LklCVS5zaG91bGQuZXF1YWwoODkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkJlZXJEZXNjcmlwdGlvbi5zaG91bGQubm90LmJlLmVtcHR5O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3S2VnSWQgPSByZXMuYm9keS5LZWdJZDtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdzaG91bGQgbGlzdCBjdXJyZW50IGtlZ3Mgb24gL2FwaS9DdXJyZW50S2VnIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL0N1cnJlbnRLZWcnKVxyXG4gICAgICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdLZWdJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JyZXdlcnknKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlclR5cGUnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQUJWJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0lCVScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyRGVzY3JpcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVW50YXBwZElkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ2ltYWdlUGF0aCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBnZXQgZmlyc3QgY3VycmVudCBrZWcgb24gL2FwaS9DdXJyZW50S2VnLzxpZD4gR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvQ3VycmVudEtlZy8xJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnS2VnSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdCcmV3ZXJ5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJUeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FCVicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdJQlUnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckRlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1VudGFwcGRJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdpbWFnZVBhdGgnKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGRlc2NyaWJlKCdTdGVwIDI6IE1vdW50IGtlZyBvbiB0YXAnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkvQ3VycmVudEtlZy88aWQ+IFBVVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvQ3VycmVudEtlZy8xJylcclxuICAgICAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNlbmQoe0tlZ0lkOiA2LCBLZWdTaXplOiAxNzAwMH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgcmVxdWlyZSBhZG1pbiBiZWFyZXIgdG9rZW4gYXV0aGVudGljYXRpb24gb24gL2FwaS9DdXJyZW50S2VnLzxpZD4gUFVUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnB1dCgnL2FwaS9DdXJyZW50S2VnLzEnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKHtLZWdJZDogNiwgS2VnU2l6ZTogMTcwMDB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIG1ha2UgcHJldmlvdXNseSBpbnN0YWxsZWQga2VnIGN1cnJlbnQgL2FwaS9DdXJyZW50S2VnLzxpZD4gUFVUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnB1dCgnL2FwaS9DdXJyZW50S2VnLzEnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBhZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgS2VnSWQ6IG5ld0tlZ0lkLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgS2VnU2l6ZTogMTcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ29iamVjdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5UYXBJZC5zaG91bGQuZXF1YWwoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LktlZ0lkLnNob3VsZC5lcXVhbChuZXdLZWdJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LktlZ1NpemUuc2hvdWxkLmVxdWFsKDE3MDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQ3VycmVudFZvbHVtZS5zaG91bGQuZXF1YWwoMTcwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBzcGVjaWZpZWQgdGhlc2UgYXR0cmlidXRlIHZhbHVlcyB3aGVuIHdlIHBvc3RlZCB0aGUga2VnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lk5hbWUuc2hvdWxkLmVxdWFsKCd0ZXN0IGJlZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQnJld2VyeS5zaG91bGQuZXF1YWwoJ3Rlc3QgYnJld2VyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5CZWVyVHlwZS5zaG91bGQuZXF1YWwoJ0lQQScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5BQlYuc2hvdWxkLmVxdWFsKDEwLjUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5JQlUuc2hvdWxkLmVxdWFsKDg5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQmVlckRlc2NyaXB0aW9uLnNob3VsZC5ub3QuYmUuZW1wdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVzY3JpYmUoJ1N0ZXAgMzogR2VuZXJhdGUgYWN0aXZpdHkgb24gbmV3IGtlZycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIGdldCBhbGwgYWN0aXZpdGllcyBvbiAvYXBpL2FjdGl2aXR5IEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmdldCgnL2FwaS9hY3Rpdml0eScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1Nlc3Npb25JZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BvdXJUaW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUG91ckFtb3VudCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQnJld2VyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJUeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQUJWJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnSUJVJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckRlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVW50YXBwZElkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckltYWdlUGF0aCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FsaWFzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnRnVsbE5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdG9kbzogY2hlY2sgdGhhdCBmaXJzdCBwb3VyIHRpbWUgaXMgZXF1YWwgdG8gb3IgZWFybGllciB0aGFuIHNlY29uZCAoZGVzY2VuZGluZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBnZXQgc3BlY2lmaWMgYWN0aXZpdHkgb24gL2FwaS9hY3Rpdml0eS88aWQ+IEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmdldCgnL2FwaS9hY3Rpdml0eS8xJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1Nlc3Npb25JZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BvdXJUaW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUG91ckFtb3VudCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQnJld2VyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJUeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQUJWJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnSUJVJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckRlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVW50YXBwZElkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckltYWdlUGF0aCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FsaWFzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnRnVsbE5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBhZGQgbmV3IGFjdGl2aXR5IG9uIC9hcGkvYWN0aXZpdHkgUE9TVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc3QoJy9hcGkvYWN0aXZpdHknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25UaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIxXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW1vdW50OiAxNTVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiMlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDogMjEwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmFuKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkubGVuZ3RoLnNob3VsZC5lcXVhbCgyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXBPbmUgPSAoPEFycmF5PGFueT4+cmVzLmJvZHkpLmZpbmQoYWN0aXZpdHkgPT4gYWN0aXZpdHkuVGFwSWQgPT0gMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFwVHdvID0gKDxBcnJheTxhbnk+PnJlcy5ib2R5KS5maW5kKGFjdGl2aXR5ID0+IGFjdGl2aXR5LlRhcElkID09IDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkLm5vdC5lcXVhbCh0YXBPbmUsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFwT25lLnNob3VsZC5oYXZlLnByb3BlcnR5KCdBY3Rpdml0eUlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXBPbmUuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0tlZ0lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXBPbmUuYW1vdW50LnNob3VsZC5lcXVhbCgxNTUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkLm5vdC5lcXVhbCh0YXBUd28sIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFwVHdvLmFtb3VudC5zaG91bGQuZXF1YWwoMjEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBhZGQgbmV3IGFjdGl2aXR5IGJ1dCBub3QgZm9yIGVtcHR5IHRhcHMgb24gL2FwaS9hY3Rpdml0eSBQT1NUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9zdCgnL2FwaS9hY3Rpdml0eScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbm5lbE51bWJlcjogTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjFcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiMlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDogMjEwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmFuKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkubGVuZ3RoLnNob3VsZC5lcXVhbCgxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLmFtb3VudC5zaG91bGQuZXF1YWwoMjEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmUoJ1N0ZXAgNDogVmFsaWRhdGUgdGhhdCBhY3Rpdml0eSBoYXMgcmVkdWNlZCB2b2x1bWUgaW4ga2VnJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIGhhdmUgcmVkdWNlZCBrZWcgdm9sdW1uZSBhZnRlciBhY3Rpdml0eSAvYXBpL0N1cnJlbnRLZWcgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvQ3VycmVudEtlZy8xJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LktlZ1NpemUuc2hvdWxkLmVxdWFsKDE3MDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5DdXJyZW50Vm9sdW1lLnNob3VsZC5lcXVhbCgxNzAwMCAtIDE1NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGdldCB2YWxpZCBzcGVjaWZpYyBwZXJzb24gb24gL2FwaS9pc1BlcnNvblZhbGlkLzxpZD4gR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9pc1BlcnNvblZhbGlkLzE4MDE5NTgnKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVmFsaWQnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0Z1bGxOYW1lJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlZhbGlkLnNob3VsZC5lcXVhbHModHJ1ZSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBnZXQgbm90IHZhbGlkIHNwZWNpZmljIHBlcnNvbiBvbiAvYXBpL2lzUGVyc29uVmFsaWQvPGlkPiBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL2lzUGVyc29uVmFsaWQvMTk1ODE0NCcpXHJcbiAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUGVyc29ubmVsTnVtYmVyJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdWYWxpZCcpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnRnVsbE5hbWUnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuVmFsaWQuc2hvdWxkLmVxdWFscyhmYWxzZSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCA0MDQgb24gaW52YWxpZCBwZXJzb24gb24gL2FwaS9pc1BlcnNvblZhbGlkLzxpZD4gR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9pc1BlcnNvblZhbGlkLzAwMDAwMDAnKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwNCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gYW4gYXJyYXkgb2YgdmFsaWQgdXNlcnMgb24gL2FwaS92YWxpZHBlb3BsZSBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgLy8gVGhpcyBpcyBhIExPTkcgb3BlcmF0aW9uLi4uXHJcbiAgICAgICAgdGhpcy50aW1lb3V0KDYwMDAwKTtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdmFsaWRwZW9wbGUnKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmFuKCdhcnJheScpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQubm90LmJlLmVtcHR5O1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUGVyc29ubmVsTnVtYmVyJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdWYWxpZCcpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnRnVsbE5hbWUnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0NhcmRJZCcpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5WYWxpZC5zaG91bGQuZXF1YWwodHJ1ZSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCA0MDEgb24gaW52YWxpZCBiZWFyZXIgdG9rZW4gb24gL2FwaS91c2VycyBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3VzZXJzJylcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gYWxsIHVzZXJzIGZvciBhZG1pbiByZXF1ZXN0IHRvIC9hcGkvdXNlcnMgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2VycycpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIGFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignYXJyYXknKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLm5vdC5iZS5lbXB0eTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHVzZXIgaW5mbyBmb3IgYmVhcmVyIHRva2VuIHVzZXIgdG8gL2FwaS91c2Vycy9tZSBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3VzZXJzL21lJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5QZXJzb25uZWxOdW1iZXIuc2hvdWxkLmJlLmVxdWFsKE51bWJlcihwcm9jZXNzLmVudi5BZG1pblBlcnNvbm5lbE51bWJlcikpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHVzZXIgaW5mbyBmb3Igbm9uLWFkbWluIGJlYXJlciB0b2tlbiB1c2VyIHRvIC9hcGkvdXNlcnMvbWUgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2Vycy9tZScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5iZS5lcXVhbChOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIG5vdCBmaW5kIHNwZWNpZmljIGludmFsaWQgdXNlciBmb3IgYWRtaW4gcmVxdWVzdCB0byAvYXBpL3VzZXJzLzp1c2VyX2lkIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMvYmxhaEBtaWNyb3NvZnQuY29tJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwNCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc3BlY2lmaWMgcGVyc29uIHRoYXQgaXMgYSB1c2VyIGZvciBhZG1pbiByZXF1ZXN0IHRvIC9hcGkvdXNlcnMvOnVzZXJfaWQgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2Vycy9qYW1lc2Jha0BtaWNyb3NvZnQuY29tJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5iZS53aXRoaW4oNDIwMDAwLCA0MzAwMDApO1xyXG4gICAgICAgICAgICBzaG91bGQubm90LmVxdWFsKHJlcy5ib2R5LlVudGFwcGRBY2Nlc3NUb2tlbiwgbnVsbCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc3BlY2lmaWMgcGVyc29uIHRoYXQgaXMgbm90IGEgdXNlciBmb3IgYWRtaW4gcmVxdWVzdCB0byAvYXBpL3VzZXJzLzp1c2VyX2lkIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMvT0xJVkVSSEBtaWNyb3NvZnQuY29tJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5lcXVhbCg1Mik7XHJcbiAgICAgICAgICAgIHNob3VsZC5lcXVhbChyZXMuYm9keS5VbnRhcHBkQWNjZXNzVG9rZW4sIG51bGwpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIDQwMCBCYWQgUmVxdWVzdCBmb3Igbm9uLWFkbWluIHJlcXVlc3QgdG8gL2FwaS91c2Vycy86dXNlcl9pZCBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3VzZXJzL09MSVZFUkhAbWljcm9zb2Z0LmNvbScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDApO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHVzZXIgaWRlbnRpZmllZCBieSBhY2Nlc3MgdG9rZW4gZm9yIG5vbi1hZG1pbiByZXF1ZXN0IHRvIC9hcGkvdXNlcnMgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2VycycpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5lcXVhbChOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSBvd24gdXNlciBpbmZvcm1hdGlvbiAvYXBpL3VzZXJzL21lIFBVVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5wdXQoJy9hcGkvdXNlcnMvbWUnKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgUGVyc29ubmVsTnVtYmVyOiBOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpLFxyXG4gICAgICAgICAgICBVbnRhcHBkVXNlck5hbWU6ICd0ZXN0X3VzZXInLFxyXG4gICAgICAgICAgICBVbnRhcHBkQWNjZXNzVG9rZW46ICcxMjM0NTYnLFxyXG4gICAgICAgICAgICBDaGVja2luRmFjZWJvb2s6IHRydWUsXHJcbiAgICAgICAgICAgIENoZWNraW5Ud2l0dGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgQ2hlY2tpbkZvdXJzcXVhcmU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAxKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUGVyc29ubmVsTnVtYmVyJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlBlcnNvbm5lbE51bWJlci5zaG91bGQuZXF1YWwoTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlVudGFwcGRVc2VyTmFtZS5zaG91bGQuZXF1YWwoJ3Rlc3RfdXNlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5DaGVja2luRmFjZWJvb2suc2hvdWxkLmVxdWFsKHRydWUpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5DaGVja2luVHdpdHRlci5zaG91bGQuZXF1YWwoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5DaGVja2luRm91cnNxdWFyZS5zaG91bGQuZXF1YWwodHJ1ZSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCB1cGRhdGUgb3duIHVzZXIgaW5mb3JtYXRpb24gL2FwaS91c2VycyBQVVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAucHV0KCcvYXBpL3VzZXJzJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSxcclxuICAgICAgICAgICAgVW50YXBwZFVzZXJOYW1lOiAndGVzdF91c2VyJyxcclxuICAgICAgICAgICAgVW50YXBwZEFjY2Vzc1Rva2VuOiAnMTIzNDU2JyxcclxuICAgICAgICAgICAgQ2hlY2tpbkZhY2Vib29rOiB0cnVlLFxyXG4gICAgICAgICAgICBDaGVja2luVHdpdHRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIENoZWNraW5Gb3Vyc3F1YXJlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMSk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5QZXJzb25uZWxOdW1iZXIuc2hvdWxkLmVxdWFsKE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlcikpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5VbnRhcHBkVXNlck5hbWUuc2hvdWxkLmVxdWFsKCd0ZXN0X3VzZXInKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiA0MDAgQmFkIFJlcXVlc3Qgd2hlbiB1cGRhdGUgZGlmZmVyZW50IHVzZXIgaW5mb3JtYXRpb24gZm9yIG5vbi1hZG1pbiBjYWxsIC9hcGkvdXNlcnMvdXNlcl9pZCBQVVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAucHV0KCcvYXBpL3VzZXJzL2JsYWhAbWljcm9zb2Z0LmNvbScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLnNlbmQoe1xyXG4gICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlciksXHJcbiAgICAgICAgICAgIFVudGFwcGRVc2VyTmFtZTogJ3Rlc3RfdXNlcicsXHJcbiAgICAgICAgICAgIFVudGFwcGRBY2Nlc3NUb2tlbjogJzEyMzQ1NicsXHJcbiAgICAgICAgICAgIENoZWNraW5GYWNlYm9vazogdHJ1ZSxcclxuICAgICAgICAgICAgQ2hlY2tpblR3aXR0ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICBDaGVja2luRm91cnNxdWFyZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDApO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIDQwMCBCYWQgUmVxdWVzdCB3aGVuIFVzZXJQcmluY2lwYWxOYW1lIGluIGJvZHkgZG9lc250IG1hdGNoIHJlc291cmNlIGluIHBhdGggL2FwaS91c2Vycy91c2VyX2lkIFBVVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5wdXQoJy9hcGkvdXNlcnMvbWUnKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgUGVyc29ubmVsTnVtYmVyOiBOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpLFxyXG4gICAgICAgICAgICBVc2VyUHJpbmNpcGFsTmFtZTogJ2JsYWhAbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgIFVudGFwcGRVc2VyTmFtZTogJ3Rlc3RfdXNlcicsXHJcbiAgICAgICAgICAgIFVudGFwcGRBY2Nlc3NUb2tlbjogJzEyMzQ1NicsXHJcbiAgICAgICAgICAgIENoZWNraW5GYWNlYm9vazogdHJ1ZSxcclxuICAgICAgICAgICAgQ2hlY2tpblR3aXR0ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICBDaGVja2luRm91cnNxdWFyZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDApO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIC8vVE9ETzpcclxuICAgIC8vIC0gVGVzdCBQVVQgdG8ga2VnRmluaXNoZWRcclxuXHJcbn0pO1xyXG4iXX0=
