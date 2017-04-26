"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('mocha');
const chai = require("chai");
chai.use(require('chai-http'));
const request = require("request");
var should = chai.should(), expect = chai.expect;
var server = require('../server').app;
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
    it('should require bearer token authentication on /api/appConfiguration GET', (done) => {
        chai.request(server)
            .get('/api/appConfiguration')
            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
            .end((err, res) => {
            res.should.have.status(401);
            done();
        });
    });
    it('should return valid application configuration for /api/appConfiguration GET', (done) => {
        chai.request(server)
            .get('/api/appConfiguration')
            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
            .end((err, res) => {
            res.should.have.status(200);
            res.body.UntappdClientId.should.equal(process.env.UntappdClientId);
            res.body.UntappdClientSecret.should.equal(process.env.UntappdClientSecret);
            done();
        });
    });
    describe('Admin api test suite', () => {
        var originalGroups;
        it('should return 401 using basic auth for /api/admin/AuthorizedGroups GET', (done) => {
            chai.request(server)
                .get('/api/admin/AuthorizedGroups')
                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
        it('should return 401 using non-admin bearer token for /api/admin/AuthorizedGroups GET', (done) => {
            chai.request(server)
                .get('/api/admin/AuthorizedGroups')
                .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
        it('should return list of authorized groups for /api/admin/AuthorizedGroups GET', (done) => {
            chai.request(server)
                .get('/api/admin/AuthorizedGroups')
                .set('Authorization', 'Bearer ' + adminBearerToken)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.AuthorizedGroups.should.be.a('array');
                res.body.AuthorizedGroups[0].should.be.a('string');
                originalGroups = res.body.AuthorizedGroups;
                done();
            });
        });
        it('should return list of searched groups for /api/admin/AuthorizedGroups?search=:searchTerm GET', (done) => {
            chai.request(server)
                .get('/api/admin/AuthorizedGroups?search=dx%20li')
                .set('Authorization', 'Bearer ' + adminBearerToken)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.count.should.at.least(1);
                res.body.results.should.be.a('array');
                res.body.results.should.have.deep.property('[0].displayName');
                res.body.results.should.have.deep.property('[0].owners');
                for (var result of res.body.results) {
                    result.displayName.toLowerCase().should.include('dx li');
                }
                done();
            });
        });
        it('should update list of authorized groups for /api/admin/AuthorizedGroups PUT', (done) => {
            this.timeout(15000);
            chai.request(server)
                .put('/api/admin/AuthorizedGroups')
                .set('Authorization', 'Bearer ' + adminBearerToken)
                .send({
                AuthorizedGroups: originalGroups.concat('test group')
            })
                .end((err, res) => {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.AuthorizedGroups.should.be.a('array');
                res.body.AuthorizedGroups.length.should.be.equal(originalGroups.length + 1);
                res.body.AuthorizedGroups.should.include('test group');
                chai.request(server)
                    .put('/api/admin/AuthorizedGroups')
                    .set('Authorization', 'Bearer ' + adminBearerToken)
                    .send({
                    AuthorizedGroups: originalGroups
                })
                    .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.AuthorizedGroups.should.have.same.members(originalGroups);
                    done();
                });
            });
        });
    });
    describe('Beer voting sequence', () => {
        var vote1Id = 0, vote2Id = 0;
        describe('Step 1: Retrieve any existing votes', () => {
            it('should require bearer token authentication on /api/votes/:user_id GET', (done) => {
                chai.request(server)
                    .get('/api/votes/' + process.env.NonAdminPersonnelNumber)
                    .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                    .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
            it('should return 404 for /api/votes/ GET', (done) => {
                chai.request(server)
                    .get('/api/votes')
                    .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                    .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
            });
            it('should return valid votes for /api/votes/:user_id GET', (done) => {
                chai.request(server)
                    .get('/api/votes/' + process.env.NonAdminPersonnelNumber)
                    .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                    .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    vote1Id = res.body[0] ? res.body[0].VoteId : 0;
                    vote2Id = res.body[1] ? res.body[1].VoteId : 0;
                    done();
                });
            });
            describe('Step 2: Delete any existing votes', () => {
                it('should delete existing votes /api/votes/:user_id PUT', (done) => {
                    chai.request(server)
                        .put('/api/votes/' + process.env.NonAdminPersonnelNumber)
                        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                        .send([vote1Id, vote2Id]
                        .filter(voteId => !!voteId)
                        .map(voteId => {
                        return {
                            VoteId: voteId,
                            UntappdId: 0
                        };
                    }))
                        .end((err, res) => {
                        res.should.have.status(201);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        res.body.should.be.empty;
                        done();
                    });
                });
                describe('Step 3: Add new votes', () => {
                    it('should add 2 new votes for /api/votes/:user_id PUT', (done) => {
                        chai.request(server)
                            .put('/api/votes/' + process.env.NonAdminPersonnelNumber)
                            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                            .send([
                            {
                                UntappdId: 12645,
                                BeerName: 'Trickster',
                                Brewery: 'Black Raven Brewing Company'
                            },
                            {
                                UntappdId: 6849,
                                BeerName: 'African Amber',
                                Brewery: 'Mac & Jack\'s Brewing Company'
                            }
                        ])
                            .end((err, res) => {
                            res.should.have.status(201);
                            res.should.be.json;
                            res.body.should.be.a('array');
                            res.body.length.should.equal(2);
                            res.body[0].VoteId.should.not.equal(0);
                            res.body[0].PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
                            new Date(Date.parse(res.body[0].VoteDate)).toDateString().should.equal(new Date().toDateString());
                            res.body[0].UntappdId.should.equal(12645);
                            res.body[0].BeerName.should.equal('Trickster');
                            res.body[0].Brewery.should.equal('Black Raven Brewing Company');
                            vote1Id = res.body[0].VoteId;
                            vote2Id = res.body[1].VoteId;
                            done();
                        });
                    });
                    describe('Step 4: Verify that our votes appear in the votes tally', () => {
                        it('should return 401 with no bearer token to /api/votes_tally', (done) => {
                            chai.request(server)
                                .get('/api/votes_tally')
                                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                                .end((err, res) => {
                                res.should.have.status(401);
                                done();
                            });
                        });
                        it('should return current vote tally including cast votes for /api/votes_tally', (done) => {
                            chai.request(server)
                                .get('/api/votes_tally')
                                .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                                .end((err, res) => {
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.be.a('array');
                                res.body.should.not.be.empty;
                                var tricksterVotes = res.body.find(tally => tally.UntappdId == 12645);
                                tricksterVotes.should.not.be.undefined;
                                tricksterVotes.BeerName.should.equal('Trickster');
                                tricksterVotes.VoteCount.should.be.least(1);
                                var africanAmberVotes = res.body.find(tally => tally.UntappdId == 6849);
                                africanAmberVotes.should.not.be.undefined;
                                africanAmberVotes.BeerName.should.equal('African Amber');
                                africanAmberVotes.VoteCount.should.be.least(1);
                                done();
                            });
                        });
                        describe('Step 5: Install Trickster keg to verify that all Trickster votes are erased.', () => {
                            it('should remove active votes when beer is installed for /api/votes_tally GET', function (done) {
                                chai.request(server)
                                    .post('/api/kegs')
                                    .set('Authorization', 'Bearer ' + adminBearerToken)
                                    .send({
                                    Name: 'Trickster',
                                    Brewery: 'Black Raven Brewing Company',
                                    BeerType: 'IPA - American',
                                    ABV: 6.9,
                                    IBU: 70,
                                    BeerDescription: 'in mythology, the raven can play tricks or otherwise disobey normal rules, hence the name Trickster. this well-balanced IPA has a light fruit, citrus and piney hop aroma with a full hop flavor.',
                                    UntappdId: 12645
                                })
                                    .end((err, res) => {
                                    res.should.have.status(200);
                                    var kegId = res.body.KegId;
                                    chai.request(server)
                                        .put('/api/CurrentKeg/1')
                                        .set('Authorization', 'Bearer ' + adminBearerToken)
                                        .send({
                                        KegId: kegId,
                                        KegSize: 19500
                                    })
                                        .end((err, res) => {
                                        res.should.have.status(200);
                                        chai.request(server)
                                            .get('/api/votes_tally')
                                            .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                                            .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.should.not.be.empty;
                                            var tricksterVotes = res.body.find(tally => tally.UntappdId == 12645);
                                            expect(tricksterVotes).to.be.undefined;
                                            var africanAmberVotes = res.body.find(tally => tally.UntappdId == 6849);
                                            africanAmberVotes.should.not.be.undefined;
                                            africanAmberVotes.BeerName.should.equal('African Amber');
                                            africanAmberVotes.VoteCount.should.be.least(1);
                                            done();
                                        });
                                    });
                                });
                            });
                            describe('Step 6: Validate that users votes for installed keg have been cleared', () => {
                                it('should return only 1 vote for /api/votes/:user_id GET', (done) => {
                                    chai.request(server)
                                        .get('/api/votes/' + process.env.NonAdminPersonnelNumber)
                                        .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                                        .end((err, res) => {
                                        res.should.have.status(200);
                                        res.should.be.json;
                                        res.body.should.be.a('array');
                                        res.body.should.be.lengthOf(1);
                                        res.body[0].VoteId.should.equal(vote2Id);
                                        res.body[0].UntappdId.should.equal(6849);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('Package server tests', function () {
        it('should return 401 with no auth for /api/updates/iocontroller GET', (done) => {
            chai.request(server)
                .get('/api/updates/iocontroller')
                .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
        it('should return 404 with unknown package for /api/updates/foobar GET', (done) => {
            chai.request(server)
                .get('/api/updates/foobar')
                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
        it('should return full list of published packages for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController')
                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(2);
                res.body.should.have.deep.property('[0].Version', 'v0.1');
                res.body.should.have.deep.property('[1].Version', 'v0.3');
                res.body.should.have.deep.property('[1].Configuration');
                res.body.should.have.deep.property('[1].PackageUri')
                    .that.includes('https://dxliquidintelupdate.blob.core.windows.net/iocontroller-test/v0.3/IOController.tar.gz');
                done();
            });
        });
        it('should return full list of published and unpublished packages for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController?include-unpublished=true')
                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(3);
                res.body.should.have.deep.property('[0].IsPublished', true);
                res.body.should.have.deep.property('[2].Version', 'v0.4');
                res.body.should.have.deep.property('[2].IsPublished', false);
                done();
            });
        });
        it('should return minimal list of published packages for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController?min-version=0.2&include-unpublished=false')
                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(1);
                res.body.should.have.deep.property('[0].Version', 'v0.3');
                res.body.should.not.have.deep.property('[0].IsPublished');
                done();
            });
        });
        it('should return minimal list of published and unpublished packages for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController?include-unpublished=true&min-version=0.2')
                .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(2);
                res.body.should.have.deep.property('[0].Version', 'v0.3');
                res.body.should.have.deep.property('[0].IsPublished', true);
                res.body.should.have.deep.property('[1].Version', 'v0.4');
                res.body.should.have.deep.property('[1].IsPublished', false);
                done();
            });
        });
        it('should return list of published and unpublished packages filtered by semver for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController?include-unpublished=true&min-version=v0.2')
                .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(2);
                res.body.should.have.deep.property('[0].Version', 'v0.3');
                res.body.should.have.deep.property('[0].IsPublished', true);
                res.body.should.have.deep.property('[1].Version', 'v0.4');
                res.body.should.have.deep.property('[1].IsPublished', false);
                done();
            });
        });
        it('should return list of published and unpublished packages greater than specified semver for /api/updates/IOController GET', (done) => {
            chai.request(server)
                .get('/api/updates/IOController?include-unpublished=true&min-version_gt=0.3')
                .set('Authorization', 'Bearer ' + nonAdminBearerToken)
                .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.equal(1);
                res.body.should.have.deep.property('[0].Version', 'v0.4');
                res.body.should.have.deep.property('[0].IsPublished', false);
                done();
            });
        });
    });
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUMvQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUM1QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUN4QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NEJBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQ2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxD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QUMsRUFBRSxDQUFDLElBQUksQ0FBQTtnQkFDbEIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdELElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUE7UUFDVixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC9hcGl0ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoJ21vY2hhJyk7XHJcbmltcG9ydCBjaGFpID0gcmVxdWlyZSgnY2hhaScpO1xyXG5jaGFpLnVzZShyZXF1aXJlKCdjaGFpLWh0dHAnKSk7XHJcbmltcG9ydCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpXHJcbnZhciBzaG91bGQgPSBjaGFpLnNob3VsZCgpLFxyXG4gICAgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XHJcbnZhciBzZXJ2ZXIgPSByZXF1aXJlKCcuLi9zZXJ2ZXInKS5hcHA7XHJcblxyXG52YXIgYWRtaW5CZWFyZXJUb2tlbjogU3RyaW5nO1xyXG52YXIgbm9uQWRtaW5CZWFyZXJUb2tlbjogc3RyaW5nO1xyXG52YXIgbmV3S2VnSWQ6IG51bWJlcjtcclxuXHJcbmZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKHJlZnJlc2hUb2tlbjogc3RyaW5nLCBuZXh0OiAoZXJyOiBFcnJvciwgZXJyb3JSZXNwb25zZTogYW55LCB0b2tlbjogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICAvLyBGZXRjaCBiZWFyZXIgdG9rZW4gdXNpbmcgcmVmcmVzaCB0b2tlbiBzcGVjaWZpZWQgaW4gZW52IHZhcnNcclxuICAgIHJlcXVlc3QucG9zdCh7XHJcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tLyR7cHJvY2Vzcy5lbnYuVGVuYW50fS9vYXV0aDIvdG9rZW5gLFxyXG4gICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgZm9ybToge1xyXG4gICAgICAgICAgICAnZ3JhbnRfdHlwZSc6ICdyZWZyZXNoX3Rva2VuJyxcclxuICAgICAgICAgICAgJ2NsaWVudF9pZCc6IHByb2Nlc3MuZW52LkFkbWluQ2xpZW50SWQsXHJcbiAgICAgICAgICAgICdjbGllbnRfc2VjcmV0JzogcHJvY2Vzcy5lbnYuQWRtaW5DbGllbnRTZWNyZXQsXHJcbiAgICAgICAgICAgICdyZXNvdXJjZSc6IHByb2Nlc3MuZW52LkNsaWVudElkLFxyXG4gICAgICAgICAgICAncmVmcmVzaF90b2tlbic6IHJlZnJlc2hUb2tlblxyXG4gICAgICAgIH1cclxuICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBuZXh0KGVyciwgbnVsbCwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gNDAwKSB7XHJcbiAgICAgICAgICAgIG5leHQobnVsbCwgYm9keSwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuZXh0KG51bGwsIG51bGwsIGJvZHkuYWNjZXNzX3Rva2VuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuZGVzY3JpYmUoJ3Rlc3RpbmcgYXBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnRpbWVvdXQoNzAwMCk7XHJcblxyXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xyXG4gICAgICAgIC8vIEZldGNoIGJlYXJlciB0b2tlbiB1c2luZyByZWZyZXNoIHRva2VuIHNwZWNpZmllZCBpbiBlbnYgdmFyc1xyXG4gICAgICAgIGdldEFjY2Vzc1Rva2VuKHByb2Nlc3MuZW52LkFkbWluUmVmcmVzaFRva2VuLCAoZXJyLCBlcnJvclJlc3BvbnNlLCB0b2tlbikgPT4ge1xyXG4gICAgICAgICAgICBpZiAodG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIGFkbWluQmVhcmVyVG9rZW4gPSB0b2tlbjtcclxuICAgICAgICAgICAgICAgIGdldEFjY2Vzc1Rva2VuKHByb2Nlc3MuZW52Lk5vbkFkbWluUmVmcmVzaFRva2VuLCAoZXJyLCBlcnJvclJlc3BvbnNlLCB0b2tlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub25BZG1pbkJlYXJlclRva2VuID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyIHx8IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShlcnJvclJlc3BvbnNlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZG9uZShlcnIgfHwgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGVycm9yUmVzcG9uc2UpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gNDA0IG9uIC8gR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnLycpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmVzcG9uZCB3aXRoIHdlbGNvbWUgdG8gL2FwaSBvbiAvYXBpIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGknKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5Lm1lc3NhZ2Uuc2hvdWxkLmVxdWFsKCdXZWxjb21lIHRvIERYIExpcXVpZCBJbnRlbGxpZ2VuY2UgYXBpIScpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgbGlzdCBrZWdzIG9uIC9hcGkva2VncyBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL2tlZ3MnKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdLZWdJZCcpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnTmFtZScpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQnJld2VyeScpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlclR5cGUnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FCVicpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnSUJVJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyRGVzY3JpcHRpb24nKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1VudGFwcGRJZCcpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnaW1hZ2VQYXRoJyk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBsaXN0IGtlZ3Mgd2l0aCBiZWFyZXIgdG9rZW4gb24gL2FwaS9rZWdzIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkva2VncycpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCdJbnN0YWxsIG5ldyBrZWcsIG1vdW50IGl0IG9uIGEgdGFwLCBydW4gYWN0aXZpdHkgJiB2YWxpZGF0ZSB0aGF0IHRoZSBrZWcgdm9sdW1lIGhhcyBkcm9wcGVkJywgKCkgPT4ge1xyXG4gICAgICAgIGRlc2NyaWJlKCdTdGVwIDE6IEluc3RhbGwgbmV3IGtlZycsICgpID0+IHtcclxuICAgICAgICAgICAgaXQoJ3Nob3VsZCByZXF1aXJlIGJlYXJlciB0b2tlbiBhdXRoZW50aWNhdGlvbiBvbiAvYXBpL2tlZ3MgUE9TVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAucG9zdCgnL2FwaS9rZWdzJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ3Nob3VsZCByZXF1aXJlIGFkbWluIGJlYXJlciB0b2tlbiBhdXRoZW50aWNhdGlvbiBvbiAvYXBpL2tlZ3MgUE9TVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAucG9zdCgnL2FwaS9rZWdzJylcclxuICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGFkZCBuZXcga2VnIHdpdGggYWxsIGF0dHJpYnV0ZXMgZXhwbGljaXRseSBzcGVjaWZpZWQgb24gL2FwaS9rZWdzIFBPU1QnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgLnBvc3QoJy9hcGkva2VncycpXHJcbiAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICBOYW1lOiAndGVzdCBiZWVyJyxcclxuICAgICAgICAgICAgICAgICAgICBCcmV3ZXJ5OiAndGVzdCBicmV3ZXJ5JyxcclxuICAgICAgICAgICAgICAgICAgICBCZWVyVHlwZTogJ0lQQScsXHJcbiAgICAgICAgICAgICAgICAgICAgQUJWOiAxMC41LFxyXG4gICAgICAgICAgICAgICAgICAgIElCVTogODksXHJcbiAgICAgICAgICAgICAgICAgICAgQmVlckRlc2NyaXB0aW9uOiAnVGhpcyBpcyBhIHJlYWxseSBuaWNlLCBob3BweSBiZWVyIScsXHJcbiAgICAgICAgICAgICAgICAgICAgVW50YXBwZElkOiAxMjY0NVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdvYmplY3QnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5OYW1lLnNob3VsZC5lcXVhbCgndGVzdCBiZWVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQnJld2VyeS5zaG91bGQuZXF1YWwoJ3Rlc3QgYnJld2VyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkJlZXJUeXBlLnNob3VsZC5lcXVhbCgnSVBBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQUJWLnNob3VsZC5lcXVhbCgxMC41KTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5JQlUuc2hvdWxkLmVxdWFsKDg5KTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5CZWVyRGVzY3JpcHRpb24uc2hvdWxkLm5vdC5iZS5lbXB0eTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGZvciBsYXRlclxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0tlZ0lkID0gcmVzLmJvZHkuS2VnSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGxpc3QgY3VycmVudCBrZWdzIG9uIC9hcGkvQ3VycmVudEtlZyBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgLmdldCgnL2FwaS9DdXJyZW50S2VnJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnS2VnSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCcmV3ZXJ5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJUeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FCVicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdJQlUnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQmVlckRlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1VudGFwcGRJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdpbWFnZVBhdGgnKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdzaG91bGQgZ2V0IGZpcnN0IGN1cnJlbnQga2VnIG9uIC9hcGkvQ3VycmVudEtlZy88aWQ+IEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL0N1cnJlbnRLZWcvMScpXHJcbiAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0tlZ0lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ05hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQnJld2VyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyVHlwZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdBQlYnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnSUJVJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJEZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdVbnRhcHBkSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnaW1hZ2VQYXRoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBkZXNjcmliZSgnU3RlcCAyOiBNb3VudCBrZWcgb24gdGFwJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCByZXF1aXJlIGJlYXJlciB0b2tlbiBhdXRoZW50aWNhdGlvbiBvbiAvYXBpL0N1cnJlbnRLZWcvPGlkPiBQVVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAucHV0KCcvYXBpL0N1cnJlbnRLZWcvMScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKHtLZWdJZDogNiwgS2VnU2l6ZTogMTcwMDB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYWRtaW4gYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkvQ3VycmVudEtlZy88aWQ+IFBVVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvQ3VycmVudEtlZy8xJylcclxuICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAuc2VuZCh7S2VnSWQ6IDYsIEtlZ1NpemU6IDE3MDAwfSlcclxuICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBtYWtlIHByZXZpb3VzbHkgaW5zdGFsbGVkIGtlZyBjdXJyZW50IC9hcGkvQ3VycmVudEtlZy88aWQ+IFBVVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvQ3VycmVudEtlZy8xJylcclxuICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEtlZ0lkOiBuZXdLZWdJZCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEtlZ1NpemU6IDE3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdvYmplY3QnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuVGFwSWQuc2hvdWxkLmVxdWFsKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5LZWdJZC5zaG91bGQuZXF1YWwobmV3S2VnSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5LZWdTaXplLnNob3VsZC5lcXVhbCgxNzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkN1cnJlbnRWb2x1bWUuc2hvdWxkLmVxdWFsKDE3MDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2Ugc3BlY2lmaWVkIHRoZXNlIGF0dHJpYnV0ZSB2YWx1ZXMgd2hlbiB3ZSBwb3N0ZWQgdGhlIGtlZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5OYW1lLnNob3VsZC5lcXVhbCgndGVzdCBiZWVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkJyZXdlcnkuc2hvdWxkLmVxdWFsKCd0ZXN0IGJyZXdlcnknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQmVlclR5cGUuc2hvdWxkLmVxdWFsKCdJUEEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQUJWLnNob3VsZC5lcXVhbCgxMC41KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuSUJVLnNob3VsZC5lcXVhbCg4OSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkJlZXJEZXNjcmlwdGlvbi5zaG91bGQubm90LmJlLmVtcHR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlc2NyaWJlKCdTdGVwIDM6IEdlbmVyYXRlIGFjdGl2aXR5IG9uIG5ldyBrZWcnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBnZXQgYWxsIGFjdGl2aXRpZXMgb24gL2FwaS9hY3Rpdml0eSBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvYWN0aXZpdHknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdTZXNzaW9uSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdQb3VyVGltZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BvdXJBbW91bnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JyZXdlcnknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyVHlwZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FCVicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0lCVScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJEZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1VudGFwcGRJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJJbWFnZVBhdGgnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdBbGlhcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0Z1bGxOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RvZG86IGNoZWNrIHRoYXQgZmlyc3QgcG91ciB0aW1lIGlzIGVxdWFsIHRvIG9yIGVhcmxpZXIgdGhhbiBzZWNvbmQgKGRlc2NlbmRpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgZ2V0IHNwZWNpZmljIGFjdGl2aXR5IG9uIC9hcGkvYWN0aXZpdHkvPGlkPiBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvYWN0aXZpdHkvMScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdTZXNzaW9uSWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQb3VyVGltZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BvdXJBbW91bnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JyZXdlcnknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdCZWVyVHlwZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0FCVicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0lCVScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJEZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1VudGFwcGRJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0JlZXJJbWFnZVBhdGgnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdBbGlhcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0Z1bGxOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgYWRkIG5ldyBhY3Rpdml0eSBvbiAvYXBpL2FjdGl2aXR5IFBPU1QnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3N0KCcvYXBpL2FjdGl2aXR5JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uVGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyOiBOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFwczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiMVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDogMTU1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IDIxMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lmxlbmd0aC5zaG91bGQuZXF1YWwoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFwT25lID0gKDxBcnJheTxhbnk+PnJlcy5ib2R5KS5maW5kKGFjdGl2aXR5ID0+IGFjdGl2aXR5LlRhcElkID09IDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhcFR3byA9ICg8QXJyYXk8YW55Pj5yZXMuYm9keSkuZmluZChhY3Rpdml0eSA9PiBhY3Rpdml0eS5UYXBJZCA9PSAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZC5ub3QuZXF1YWwodGFwT25lLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcE9uZS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnQWN0aXZpdHlJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFwT25lLnNob3VsZC5oYXZlLnByb3BlcnR5KCdLZWdJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFwT25lLmFtb3VudC5zaG91bGQuZXF1YWwoMTU1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZC5ub3QuZXF1YWwodGFwVHdvLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcFR3by5hbW91bnQuc2hvdWxkLmVxdWFsKDIxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgYWRkIG5ldyBhY3Rpdml0eSBidXQgbm90IGZvciBlbXB0eSB0YXBzIG9uIC9hcGkvYWN0aXZpdHkgUE9TVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc3QoJy9hcGkvYWN0aXZpdHknKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25UaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIxXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW1vdW50OiAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjJcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IDIxMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lmxlbmd0aC5zaG91bGQuZXF1YWwoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5hbW91bnQuc2hvdWxkLmVxdWFsKDIxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaWJlKCdTdGVwIDQ6IFZhbGlkYXRlIHRoYXQgYWN0aXZpdHkgaGFzIHJlZHVjZWQgdm9sdW1lIGluIGtlZycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBoYXZlIHJlZHVjZWQga2VnIHZvbHVtbmUgYWZ0ZXIgYWN0aXZpdHkgL2FwaS9DdXJyZW50S2VnIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL0N1cnJlbnRLZWcvMScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5LZWdTaXplLnNob3VsZC5lcXVhbCgxNzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQ3VycmVudFZvbHVtZS5zaG91bGQuZXF1YWwoMTcwMDAgLSAxNTUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBnZXQgdmFsaWQgc3BlY2lmaWMgcGVyc29uIG9uIC9hcGkvaXNQZXJzb25WYWxpZC88aWQ+IEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvaXNQZXJzb25WYWxpZC8xODAxOTU4JylcclxuICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1ZhbGlkJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdGdWxsTmFtZScpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5WYWxpZC5zaG91bGQuZXF1YWxzKHRydWUpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgZ2V0IG5vdCB2YWxpZCBzcGVjaWZpYyBwZXJzb24gb24gL2FwaS9pc1BlcnNvblZhbGlkLzxpZD4gR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9pc1BlcnNvblZhbGlkLzE5NTgxNDQnKVxyXG4gICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVmFsaWQnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ0Z1bGxOYW1lJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlZhbGlkLnNob3VsZC5lcXVhbHMoZmFsc2UpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgNDA0IG9uIGludmFsaWQgcGVyc29uIG9uIC9hcGkvaXNQZXJzb25WYWxpZC88aWQ+IEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvaXNQZXJzb25WYWxpZC8wMDAwMDAwJylcclxuICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIHZhbGlkIHVzZXJzIG9uIC9hcGkvdmFsaWRwZW9wbGUgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIC8vIFRoaXMgaXMgYSBMT05HIG9wZXJhdGlvbi4uLlxyXG4gICAgICAgIHRoaXMudGltZW91dCg2MDAwMCk7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3ZhbGlkcGVvcGxlJylcclxuICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignYXJyYXknKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLm5vdC5iZS5lbXB0eTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keVswXS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnVmFsaWQnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uc2hvdWxkLmhhdmUucHJvcGVydHkoJ0Z1bGxOYW1lJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdDYXJkSWQnKTtcclxuICAgICAgICAgICAgcmVzLmJvZHlbMF0uVmFsaWQuc2hvdWxkLmVxdWFsKHRydWUpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgNDAxIG9uIGludmFsaWQgYmVhcmVyIHRva2VuIG9uIC9hcGkvdXNlcnMgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2VycycpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGFsbCB1c2VycyBmb3IgYWRtaW4gcmVxdWVzdCB0byAvYXBpL3VzZXJzIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMnKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBhZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYW4oJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5ub3QuYmUuZW1wdHk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5WzBdLnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiB1c2VyIGluZm8gZm9yIGJlYXJlciB0b2tlbiB1c2VyIHRvIC9hcGkvdXNlcnMvbWUgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2Vycy9tZScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIGFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5iZS5lcXVhbChOdW1iZXIocHJvY2Vzcy5lbnYuQWRtaW5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiB1c2VyIGluZm8gZm9yIG5vbi1hZG1pbiBiZWFyZXIgdG9rZW4gdXNlciB0byAvYXBpL3VzZXJzL21lIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMvbWUnKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUGVyc29ubmVsTnVtYmVyJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlBlcnNvbm5lbE51bWJlci5zaG91bGQuYmUuZXF1YWwoTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBub3QgZmluZCBzcGVjaWZpYyBpbnZhbGlkIHVzZXIgZm9yIGFkbWluIHJlcXVlc3QgdG8gL2FwaS91c2Vycy86dXNlcl9pZCBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3VzZXJzL2JsYWhAbWljcm9zb2Z0LmNvbScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIGFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNwZWNpZmljIHBlcnNvbiB0aGF0IGlzIGEgdXNlciBmb3IgYWRtaW4gcmVxdWVzdCB0byAvYXBpL3VzZXJzLzp1c2VyX2lkIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMvamFtZXNiYWtAbWljcm9zb2Z0LmNvbScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIGFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlBlcnNvbm5lbE51bWJlci5zaG91bGQuYmUud2l0aGluKDQyMDAwMCwgNDMwMDAwKTtcclxuICAgICAgICAgICAgc2hvdWxkLm5vdC5lcXVhbChyZXMuYm9keS5VbnRhcHBkQWNjZXNzVG9rZW4sIG51bGwpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNwZWNpZmljIHBlcnNvbiB0aGF0IGlzIG5vdCBhIHVzZXIgZm9yIGFkbWluIHJlcXVlc3QgdG8gL2FwaS91c2Vycy86dXNlcl9pZCBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAuZ2V0KCcvYXBpL3VzZXJzL09MSVZFUkhAbWljcm9zb2Z0LmNvbScpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIGFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlBlcnNvbm5lbE51bWJlci5zaG91bGQuZXF1YWwoNTIpO1xyXG4gICAgICAgICAgICBzaG91bGQuZXF1YWwocmVzLmJvZHkuVW50YXBwZEFjY2Vzc1Rva2VuLCBudWxsKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiA0MDAgQmFkIFJlcXVlc3QgZm9yIG5vbi1hZG1pbiByZXF1ZXN0IHRvIC9hcGkvdXNlcnMvOnVzZXJfaWQgR0VUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS91c2Vycy9PTElWRVJIQG1pY3Jvc29mdC5jb20nKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAwKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiB1c2VyIGlkZW50aWZpZWQgYnkgYWNjZXNzIHRva2VuIGZvciBub24tYWRtaW4gcmVxdWVzdCB0byAvYXBpL3VzZXJzIEdFVCcsIGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgIC5nZXQoJy9hcGkvdXNlcnMnKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5wcm9wZXJ0eSgnUGVyc29ubmVsTnVtYmVyJyk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlBlcnNvbm5lbE51bWJlci5zaG91bGQuZXF1YWwoTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCB1cGRhdGUgb3duIHVzZXIgaW5mb3JtYXRpb24gL2FwaS91c2Vycy9tZSBQVVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAucHV0KCcvYXBpL3VzZXJzL21lJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSxcclxuICAgICAgICAgICAgVW50YXBwZFVzZXJOYW1lOiAndGVzdF91c2VyJyxcclxuICAgICAgICAgICAgVW50YXBwZEFjY2Vzc1Rva2VuOiAnMTIzNDU2JyxcclxuICAgICAgICAgICAgQ2hlY2tpbkZhY2Vib29rOiB0cnVlLFxyXG4gICAgICAgICAgICBDaGVja2luVHdpdHRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIENoZWNraW5Gb3Vyc3F1YXJlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMSk7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUucHJvcGVydHkoJ1BlcnNvbm5lbE51bWJlcicpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5QZXJzb25uZWxOdW1iZXIuc2hvdWxkLmVxdWFsKE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlcikpO1xyXG4gICAgICAgICAgICByZXMuYm9keS5VbnRhcHBkVXNlck5hbWUuc2hvdWxkLmVxdWFsKCd0ZXN0X3VzZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuQ2hlY2tpbkZhY2Vib29rLnNob3VsZC5lcXVhbCh0cnVlKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuQ2hlY2tpblR3aXR0ZXIuc2hvdWxkLmVxdWFsKGZhbHNlKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuQ2hlY2tpbkZvdXJzcXVhcmUuc2hvdWxkLmVxdWFsKHRydWUpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdXBkYXRlIG93biB1c2VyIGluZm9ybWF0aW9uIC9hcGkvdXNlcnMgUFVUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLnB1dCgnL2FwaS91c2VycycpXHJcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgLnNlbmQoe1xyXG4gICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlciksXHJcbiAgICAgICAgICAgIFVudGFwcGRVc2VyTmFtZTogJ3Rlc3RfdXNlcicsXHJcbiAgICAgICAgICAgIFVudGFwcGRBY2Nlc3NUb2tlbjogJzEyMzQ1NicsXHJcbiAgICAgICAgICAgIENoZWNraW5GYWNlYm9vazogdHJ1ZSxcclxuICAgICAgICAgICAgQ2hlY2tpblR3aXR0ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICBDaGVja2luRm91cnNxdWFyZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDEpO1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLnByb3BlcnR5KCdQZXJzb25uZWxOdW1iZXInKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuUGVyc29ubmVsTnVtYmVyLnNob3VsZC5lcXVhbChOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuVW50YXBwZFVzZXJOYW1lLnNob3VsZC5lcXVhbCgndGVzdF91c2VyJyk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gNDAwIEJhZCBSZXF1ZXN0IHdoZW4gdXBkYXRlIGRpZmZlcmVudCB1c2VyIGluZm9ybWF0aW9uIGZvciBub24tYWRtaW4gY2FsbCAvYXBpL3VzZXJzL3VzZXJfaWQgUFVUJywgZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLnB1dCgnL2FwaS91c2Vycy9ibGFoQG1pY3Jvc29mdC5jb20nKVxyXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgUGVyc29ubmVsTnVtYmVyOiBOdW1iZXIocHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpLFxyXG4gICAgICAgICAgICBVbnRhcHBkVXNlck5hbWU6ICd0ZXN0X3VzZXInLFxyXG4gICAgICAgICAgICBVbnRhcHBkQWNjZXNzVG9rZW46ICcxMjM0NTYnLFxyXG4gICAgICAgICAgICBDaGVja2luRmFjZWJvb2s6IHRydWUsXHJcbiAgICAgICAgICAgIENoZWNraW5Ud2l0dGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgQ2hlY2tpbkZvdXJzcXVhcmU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAwKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiA0MDAgQmFkIFJlcXVlc3Qgd2hlbiBVc2VyUHJpbmNpcGFsTmFtZSBpbiBib2R5IGRvZXNudCBtYXRjaCByZXNvdXJjZSBpbiBwYXRoIC9hcGkvdXNlcnMvdXNlcl9pZCBQVVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAucHV0KCcvYXBpL3VzZXJzL21lJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogTnVtYmVyKHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKSxcclxuICAgICAgICAgICAgVXNlclByaW5jaXBhbE5hbWU6ICdibGFoQG1pY3Jvc29mdC5jb20nLFxyXG4gICAgICAgICAgICBVbnRhcHBkVXNlck5hbWU6ICd0ZXN0X3VzZXInLFxyXG4gICAgICAgICAgICBVbnRhcHBkQWNjZXNzVG9rZW46ICcxMjM0NTYnLFxyXG4gICAgICAgICAgICBDaGVja2luRmFjZWJvb2s6IHRydWUsXHJcbiAgICAgICAgICAgIENoZWNraW5Ud2l0dGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgQ2hlY2tpbkZvdXJzcXVhcmU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAwKTtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkvYXBwQ29uZmlndXJhdGlvbiBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9hcHBDb25maWd1cmF0aW9uJylcclxuICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHZhbGlkIGFwcGxpY2F0aW9uIGNvbmZpZ3VyYXRpb24gZm9yIC9hcGkvYXBwQ29uZmlndXJhdGlvbiBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgLmdldCgnL2FwaS9hcHBDb25maWd1cmF0aW9uJylcclxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5LlVudGFwcGRDbGllbnRJZC5zaG91bGQuZXF1YWwocHJvY2Vzcy5lbnYuVW50YXBwZENsaWVudElkKTtcclxuICAgICAgICAgICAgcmVzLmJvZHkuVW50YXBwZENsaWVudFNlY3JldC5zaG91bGQuZXF1YWwocHJvY2Vzcy5lbnYuVW50YXBwZENsaWVudFNlY3JldCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ0FkbWluIGFwaSB0ZXN0IHN1aXRlJywgKCkgPT4ge1xyXG4gICAgICAgIHZhciBvcmlnaW5hbEdyb3Vwczogc3RyaW5nW107XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIDQwMSB1c2luZyBiYXNpYyBhdXRoIGZvciAvYXBpL2FkbWluL0F1dGhvcml6ZWRHcm91cHMgR0VUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgLmdldCgnL2FwaS9hZG1pbi9BdXRob3JpemVkR3JvdXBzJylcclxuICAgICAgICAgICAgLmF1dGgocHJvY2Vzcy5lbnYuQmFzaWNBdXRoVXNlcm5hbWUsIHByb2Nlc3MuZW52LkJhc2ljQXV0aFBhc3N3b3JkKVxyXG4gICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gNDAxIHVzaW5nIG5vbi1hZG1pbiBiZWFyZXIgdG9rZW4gZm9yIC9hcGkvYWRtaW4vQXV0aG9yaXplZEdyb3VwcyBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAuZ2V0KCcvYXBpL2FkbWluL0F1dGhvcml6ZWRHcm91cHMnKVxyXG4gICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDAxKTtcclxuICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGxpc3Qgb2YgYXV0aG9yaXplZCBncm91cHMgZm9yIC9hcGkvYWRtaW4vQXV0aG9yaXplZEdyb3VwcyBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAuZ2V0KCcvYXBpL2FkbWluL0F1dGhvcml6ZWRHcm91cHMnKVxyXG4gICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignb2JqZWN0Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuYm9keS5BdXRob3JpemVkR3JvdXBzLnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmJvZHkuQXV0aG9yaXplZEdyb3Vwc1swXS5zaG91bGQuYmUuYSgnc3RyaW5nJyk7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEdyb3VwcyA9IHJlcy5ib2R5LkF1dGhvcml6ZWRHcm91cHM7XHJcbiAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBsaXN0IG9mIHNlYXJjaGVkIGdyb3VwcyBmb3IgL2FwaS9hZG1pbi9BdXRob3JpemVkR3JvdXBzP3NlYXJjaD06c2VhcmNoVGVybSBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAuZ2V0KCcvYXBpL2FkbWluL0F1dGhvcml6ZWRHcm91cHM/c2VhcmNoPWR4JTIwbGknKVxyXG4gICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hbignb2JqZWN0Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuYm9keS5jb3VudC5zaG91bGQuYXQubGVhc3QoMSk7XHJcbiAgICAgICAgICAgICAgICByZXMuYm9keS5yZXN1bHRzLnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmJvZHkucmVzdWx0cy5zaG91bGQuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMF0uZGlzcGxheU5hbWUnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5ib2R5LnJlc3VsdHMuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLm93bmVycycpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgbG9vcCB0aHJvdWdoIGFsbCBlbGVtZW50cyBvZiB0aGUgcmVzdWx0cy4gVHJpZWQgY2hhaS10aGluZ3MgaGVyZSwgd2hpY2ggc2hvdWxkIG1lZXQgdGhlXHJcbiAgICAgICAgICAgICAgICAvLyByZXF1aXJlbWVudHMgZm9yIHRoaXMsIGJ1dCBpdCBpcyBpbmNhcGFibGUgb2Ygc2hpZnRpbmcgdGhlIGFzc2VydGlvbiBjb250ZXh0IGJ5IGNoYWluaW5nIGluIHRoZSB3YXkgY2hhaSBub3JtYWxseSBkb2VzLlxyXG4gICAgICAgICAgICAgICAgLy8gaWUuIHRoaXMgZG9lcyBOT1Qgd29yazpcclxuICAgICAgICAgICAgICAgIC8vICByZXMuYm9keS5yZXN1bHRzLmFsbC5wcm9wZXJ0eSgnZGlzcGxheU5hbWUnKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAudGhhdC5pbmNsdWRlcygnZHggbGknKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHJlc3VsdCBvZiByZXMuYm9keS5yZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmRpc3BsYXlOYW1lLnRvTG93ZXJDYXNlKCkuc2hvdWxkLmluY2x1ZGUoJ2R4IGxpJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHVwZGF0ZSBsaXN0IG9mIGF1dGhvcml6ZWQgZ3JvdXBzIGZvciAvYXBpL2FkbWluL0F1dGhvcml6ZWRHcm91cHMgUFVUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0KDE1MDAwKTtcclxuICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvYWRtaW4vQXV0aG9yaXplZEdyb3VwcycpXHJcbiAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICBBdXRob3JpemVkR3JvdXBzOiBvcmlnaW5hbEdyb3Vwcy5jb25jYXQoJ3Rlc3QgZ3JvdXAnKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYW4oJ29iamVjdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LkF1dGhvcml6ZWRHcm91cHMuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQXV0aG9yaXplZEdyb3Vwcy5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKG9yaWdpbmFsR3JvdXBzLmxlbmd0aCArIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQXV0aG9yaXplZEdyb3Vwcy5zaG91bGQuaW5jbHVkZSgndGVzdCBncm91cCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc3RvcmUgb3VyIGdyb3Vwc1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvYWRtaW4vQXV0aG9yaXplZEdyb3VwcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBhZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdXRob3JpemVkR3JvdXBzOiBvcmlnaW5hbEdyb3Vwc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuQXV0aG9yaXplZEdyb3Vwcy5zaG91bGQuaGF2ZS5zYW1lLm1lbWJlcnMob3JpZ2luYWxHcm91cHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ0JlZXIgdm90aW5nIHNlcXVlbmNlJywgKCkgPT4ge1xyXG4gICAgICAgIHZhciB2b3RlMUlkOiBudW1iZXIgPSAwLFxyXG4gICAgICAgICAgICB2b3RlMklkOiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBkZXNjcmliZSgnU3RlcCAxOiBSZXRyaWV2ZSBhbnkgZXhpc3Rpbmcgdm90ZXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYmVhcmVyIHRva2VuIGF1dGhlbnRpY2F0aW9uIG9uIC9hcGkvdm90ZXMvOnVzZXJfaWQgR0VUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3ZvdGVzLycgKyBwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlcilcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gNDA0IGZvciAvYXBpL3ZvdGVzLyBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvdm90ZXMnKVxyXG4gICAgICAgICAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDA0KTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHZhbGlkIHZvdGVzIGZvciAvYXBpL3ZvdGVzLzp1c2VyX2lkIEdFVCcsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgLmdldCgnL2FwaS92b3Rlcy8nICsgcHJvY2Vzcy5lbnYuTm9uQWRtaW5QZXJzb25uZWxOdW1iZXIpXHJcbiAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvbjtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICB2b3RlMUlkID0gcmVzLmJvZHlbMF0gPyByZXMuYm9keVswXS5Wb3RlSWQgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHZvdGUySWQgPSByZXMuYm9keVsxXSA/IHJlcy5ib2R5WzFdLlZvdGVJZCA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBkZXNjcmliZSgnU3RlcCAyOiBEZWxldGUgYW55IGV4aXN0aW5nIHZvdGVzJywgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgZGVsZXRlIGV4aXN0aW5nIHZvdGVzIC9hcGkvdm90ZXMvOnVzZXJfaWQgUFVUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvdm90ZXMvJyArIHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKFt2b3RlMUlkLCB2b3RlMklkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHZvdGVJZCA9PiAhIXZvdGVJZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh2b3RlSWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWb3RlSWQ6IHZvdGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuZW1wdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlc2NyaWJlKCdTdGVwIDM6IEFkZCBuZXcgdm90ZXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgYWRkIDIgbmV3IHZvdGVzIGZvciAvYXBpL3ZvdGVzLzp1c2VyX2lkIFBVVCcsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wdXQoJy9hcGkvdm90ZXMvJyArIHByb2Nlc3MuZW52Lk5vbkFkbWluUGVyc29ubmVsTnVtYmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbmQoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZSByZWFsIHZhbHVlcyBoZXJlIGFzIHdlIG5lZWQgdG8gaW5zdGFsbCB0aGlzIGJlZXIgbGF0ZXIgJiB2ZXJpZnkgdGhhdCBvdXIgdm90ZSBpcyBjYW5jZWxsZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDEyNjQ1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJlZXJOYW1lOiAnVHJpY2tzdGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCcmV3ZXJ5OiAnQmxhY2sgUmF2ZW4gQnJld2luZyBDb21wYW55J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDY4NDksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmVlck5hbWU6ICdBZnJpY2FuIEFtYmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCcmV3ZXJ5OiAnTWFjICYgSmFja1xcJ3MgQnJld2luZyBDb21wYW55J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5sZW5ndGguc2hvdWxkLmVxdWFsKDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uVm90ZUlkLnNob3VsZC5ub3QuZXF1YWwoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5QZXJzb25uZWxOdW1iZXIuc2hvdWxkLmVxdWFsKE51bWJlcihwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoRGF0ZS5wYXJzZShyZXMuYm9keVswXS5Wb3RlRGF0ZSkpLnRvRGF0ZVN0cmluZygpLnNob3VsZC5lcXVhbChuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLlVudGFwcGRJZC5zaG91bGQuZXF1YWwoMTI2NDUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHlbMF0uQmVlck5hbWUuc2hvdWxkLmVxdWFsKCdUcmlja3N0ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLkJyZXdlcnkuc2hvdWxkLmVxdWFsKCdCbGFjayBSYXZlbiBCcmV3aW5nIENvbXBhbnknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGlkcyBmb3IgbGF0ZXIgdGVzdCBjYXNlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm90ZTFJZCA9IHJlcy5ib2R5WzBdLlZvdGVJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvdGUySWQgPSByZXMuYm9keVsxXS5Wb3RlSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmliZSgnU3RlcCA0OiBWZXJpZnkgdGhhdCBvdXIgdm90ZXMgYXBwZWFyIGluIHRoZSB2b3RlcyB0YWxseScsICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIDQwMSB3aXRoIG5vIGJlYXJlciB0b2tlbiB0byAvYXBpL3ZvdGVzX3RhbGx5JywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3ZvdGVzX3RhbGx5JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gY3VycmVudCB2b3RlIHRhbGx5IGluY2x1ZGluZyBjYXN0IHZvdGVzIGZvciAvYXBpL3ZvdGVzX3RhbGx5JywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3ZvdGVzX3RhbGx5JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5ub3QuYmUuZW1wdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyaWNrc3RlclZvdGVzID0gcmVzLmJvZHkuZmluZCh0YWxseSA9PiB0YWxseS5VbnRhcHBkSWQgPT0gMTI2NDUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWNrc3RlclZvdGVzLnNob3VsZC5ub3QuYmUudW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWNrc3RlclZvdGVzLkJlZXJOYW1lLnNob3VsZC5lcXVhbCgnVHJpY2tzdGVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpY2tzdGVyVm90ZXMuVm90ZUNvdW50LnNob3VsZC5iZS5sZWFzdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWZyaWNhbkFtYmVyVm90ZXMgPSByZXMuYm9keS5maW5kKHRhbGx5ID0+IHRhbGx5LlVudGFwcGRJZCA9PSA2ODQ5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnJpY2FuQW1iZXJWb3Rlcy5zaG91bGQubm90LmJlLnVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnJpY2FuQW1iZXJWb3Rlcy5CZWVyTmFtZS5zaG91bGQuZXF1YWwoJ0FmcmljYW4gQW1iZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnJpY2FuQW1iZXJWb3Rlcy5Wb3RlQ291bnQuc2hvdWxkLmJlLmxlYXN0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmUoJ1N0ZXAgNTogSW5zdGFsbCBUcmlja3N0ZXIga2VnIHRvIHZlcmlmeSB0aGF0IGFsbCBUcmlja3N0ZXIgdm90ZXMgYXJlIGVyYXNlZC4nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIHJlbW92ZSBhY3RpdmUgdm90ZXMgd2hlbiBiZWVyIGlzIGluc3RhbGxlZCBmb3IgL2FwaS92b3Rlc190YWxseSBHRVQnLCBmdW5jdGlvbihkb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucG9zdCgnL2FwaS9rZWdzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VuZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5hbWU6ICdUcmlja3N0ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCcmV3ZXJ5OiAnQmxhY2sgUmF2ZW4gQnJld2luZyBDb21wYW55JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmVlclR5cGU6ICdJUEEgLSBBbWVyaWNhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFCVjogNi45LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJQlU6IDcwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCZWVyRGVzY3JpcHRpb246ICdpbiBteXRob2xvZ3ksIHRoZSByYXZlbiBjYW4gcGxheSB0cmlja3Mgb3Igb3RoZXJ3aXNlIGRpc29iZXkgbm9ybWFsIHJ1bGVzLCBoZW5jZSB0aGUgbmFtZSBUcmlja3N0ZXIuIHRoaXMgd2VsbC1iYWxhbmNlZCBJUEEgaGFzIGEgbGlnaHQgZnJ1aXQsIGNpdHJ1cyBhbmQgcGluZXkgaG9wIGFyb21hIHdpdGggYSBmdWxsIGhvcCBmbGF2b3IuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW50YXBwZElkOiAxMjY0NVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3cgaW5zdGFsbCB0aGUgbmV3IGtlZyBvbiBhIHRhcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIga2VnSWQgPSByZXMuYm9keS5LZWdJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnB1dCgnL2FwaS9DdXJyZW50S2VnLzEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgYWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2VnSWQ6IGtlZ0lkLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtlZ1NpemU6IDE5NTAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3cgdmFsaWRhdGUgdGhhdCBvdXIgcHJldmlvdXMgdHJpY2tzdGVyIHZvdGVzIGhhdmUgYmVlbiByZW1vdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmdldCgnL2FwaS92b3Rlc190YWxseScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5ub3QuYmUuZW1wdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyaWNrc3RlclZvdGVzID0gcmVzLmJvZHkuZmluZCh0YWxseSA9PiB0YWxseS5VbnRhcHBkSWQgPT0gMTI2NDUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0cmlja3N0ZXJWb3RlcykudG8uYmUudW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZnJpY2FuQW1iZXJWb3RlcyA9IHJlcy5ib2R5LmZpbmQodGFsbHkgPT4gdGFsbHkuVW50YXBwZElkID09IDY4NDkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmcmljYW5BbWJlclZvdGVzLnNob3VsZC5ub3QuYmUudW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmcmljYW5BbWJlclZvdGVzLkJlZXJOYW1lLnNob3VsZC5lcXVhbCgnQWZyaWNhbiBBbWJlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmcmljYW5BbWJlclZvdGVzLlZvdGVDb3VudC5zaG91bGQuYmUubGVhc3QoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpYmUoJ1N0ZXAgNjogVmFsaWRhdGUgdGhhdCB1c2VycyB2b3RlcyBmb3IgaW5zdGFsbGVkIGtlZyBoYXZlIGJlZW4gY2xlYXJlZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBvbmx5IDEgdm90ZSBmb3IgL2FwaS92b3Rlcy86dXNlcl9pZCBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3ZvdGVzLycgKyBwcm9jZXNzLmVudi5Ob25BZG1pblBlcnNvbm5lbE51bWJlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIG5vbkFkbWluQmVhcmVyVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5sZW5ndGhPZigxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5WzBdLlZvdGVJZC5zaG91bGQuZXF1YWwodm90ZTJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuYm9keVswXS5VbnRhcHBkSWQuc2hvdWxkLmVxdWFsKDY4NDkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCdQYWNrYWdlIHNlcnZlciB0ZXN0cycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIDQwMSB3aXRoIG5vIGF1dGggZm9yIC9hcGkvdXBkYXRlcy9pb2NvbnRyb2xsZXIgR0VUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvdXBkYXRlcy9pb2NvbnRyb2xsZXInKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gNDA0IHdpdGggdW5rbm93biBwYWNrYWdlIGZvciAvYXBpL3VwZGF0ZXMvZm9vYmFyIEdFVCcsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3VwZGF0ZXMvZm9vYmFyJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gZnVsbCBsaXN0IG9mIHB1Ymxpc2hlZCBwYWNrYWdlcyBmb3IgL2FwaS91cGRhdGVzL0lPQ29udHJvbGxlciBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgLmdldCgnL2FwaS91cGRhdGVzL0lPQ29udHJvbGxlcicpXHJcbiAgICAgICAgICAgICAgICAuYXV0aChwcm9jZXNzLmVudi5CYXNpY0F1dGhVc2VybmFtZSwgcHJvY2Vzcy5lbnYuQmFzaWNBdXRoUGFzc3dvcmQpXHJcbiAgICAgICAgICAgICAgICAuZW5kKChlcnI6IGFueSwgcmVzOiBDaGFpSHR0cC5SZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmJlLmpzb25cclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuYSgnYXJyYXknKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5sZW5ndGguc2hvdWxkLmJlLmVxdWFsKDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLmRlZXAucHJvcGVydHkoJ1swXS5WZXJzaW9uJywgJ3YwLjEnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMV0uVmVyc2lvbicsICd2MC4zJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzFdLkNvbmZpZ3VyYXRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMV0uUGFja2FnZVVyaScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGF0LmluY2x1ZGVzKCdodHRwczovL2R4bGlxdWlkaW50ZWx1cGRhdGUuYmxvYi5jb3JlLndpbmRvd3MubmV0L2lvY29udHJvbGxlci10ZXN0L3YwLjMvSU9Db250cm9sbGVyLnRhci5neicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gZnVsbCBsaXN0IG9mIHB1Ymxpc2hlZCBhbmQgdW5wdWJsaXNoZWQgcGFja2FnZXMgZm9yIC9hcGkvdXBkYXRlcy9JT0NvbnRyb2xsZXIgR0VUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvdXBkYXRlcy9JT0NvbnRyb2xsZXI/aW5jbHVkZS11bnB1Ymxpc2hlZD10cnVlJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvblxyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lmxlbmd0aC5zaG91bGQuYmUuZXF1YWwoMyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLklzUHVibGlzaGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzJdLlZlcnNpb24nLCAndjAuNCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLmRlZXAucHJvcGVydHkoJ1syXS5Jc1B1Ymxpc2hlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBtaW5pbWFsIGxpc3Qgb2YgcHVibGlzaGVkIHBhY2thZ2VzIGZvciAvYXBpL3VwZGF0ZXMvSU9Db250cm9sbGVyIEdFVCcsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3VwZGF0ZXMvSU9Db250cm9sbGVyP21pbi12ZXJzaW9uPTAuMiZpbmNsdWRlLXVucHVibGlzaGVkPWZhbHNlJylcclxuICAgICAgICAgICAgICAgIC5hdXRoKHByb2Nlc3MuZW52LkJhc2ljQXV0aFVzZXJuYW1lLCBwcm9jZXNzLmVudi5CYXNpY0F1dGhQYXNzd29yZClcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvblxyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lmxlbmd0aC5zaG91bGQuYmUuZXF1YWwoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLlZlcnNpb24nLCAndjAuMycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5ub3QuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMF0uSXNQdWJsaXNoZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBtaW5pbWFsIGxpc3Qgb2YgcHVibGlzaGVkIGFuZCB1bnB1Ymxpc2hlZCBwYWNrYWdlcyBmb3IgL2FwaS91cGRhdGVzL0lPQ29udHJvbGxlciBHRVQnLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyKVxyXG4gICAgICAgICAgICAgICAgLmdldCgnL2FwaS91cGRhdGVzL0lPQ29udHJvbGxlcj9pbmNsdWRlLXVucHVibGlzaGVkPXRydWUmbWluLXZlcnNpb249MC4yJylcclxuICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkubGVuZ3RoLnNob3VsZC5iZS5lcXVhbCgyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMF0uVmVyc2lvbicsICd2MC4zJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLklzUHVibGlzaGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzFdLlZlcnNpb24nLCAndjAuNCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLmRlZXAucHJvcGVydHkoJ1sxXS5Jc1B1Ymxpc2hlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBsaXN0IG9mIHB1Ymxpc2hlZCBhbmQgdW5wdWJsaXNoZWQgcGFja2FnZXMgZmlsdGVyZWQgYnkgc2VtdmVyIGZvciAvYXBpL3VwZGF0ZXMvSU9Db250cm9sbGVyIEdFVCcsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIpXHJcbiAgICAgICAgICAgICAgICAuZ2V0KCcvYXBpL3VwZGF0ZXMvSU9Db250cm9sbGVyP2luY2x1ZGUtdW5wdWJsaXNoZWQ9dHJ1ZSZtaW4tdmVyc2lvbj12MC4yJylcclxuICAgICAgICAgICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBub25BZG1pbkJlYXJlclRva2VuKVxyXG4gICAgICAgICAgICAgICAgLmVuZCgoZXJyOiBhbnksIHJlczogQ2hhaUh0dHAuUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5iZS5qc29uXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmEoJ2FycmF5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkubGVuZ3RoLnNob3VsZC5iZS5lcXVhbCgyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuaGF2ZS5kZWVwLnByb3BlcnR5KCdbMF0uVmVyc2lvbicsICd2MC4zJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLklzUHVibGlzaGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzFdLlZlcnNpb24nLCAndjAuNCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLmRlZXAucHJvcGVydHkoJ1sxXS5Jc1B1Ymxpc2hlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBsaXN0IG9mIHB1Ymxpc2hlZCBhbmQgdW5wdWJsaXNoZWQgcGFja2FnZXMgZ3JlYXRlciB0aGFuIHNwZWNpZmllZCBzZW12ZXIgZm9yIC9hcGkvdXBkYXRlcy9JT0NvbnRyb2xsZXIgR0VUJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlcilcclxuICAgICAgICAgICAgICAgIC5nZXQoJy9hcGkvdXBkYXRlcy9JT0NvbnRyb2xsZXI/aW5jbHVkZS11bnB1Ymxpc2hlZD10cnVlJm1pbi12ZXJzaW9uX2d0PTAuMycpXHJcbiAgICAgICAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgbm9uQWRtaW5CZWFyZXJUb2tlbilcclxuICAgICAgICAgICAgICAgIC5lbmQoKGVycjogYW55LCByZXM6IENoYWlIdHRwLlJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zaG91bGQuYmUuanNvblxyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5hKCdhcnJheScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5Lmxlbmd0aC5zaG91bGQuYmUuZXF1YWwoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmhhdmUuZGVlcC5wcm9wZXJ0eSgnWzBdLlZlcnNpb24nLCAndjAuNCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5oYXZlLmRlZXAucHJvcGVydHkoJ1swXS5Jc1B1Ymxpc2hlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIl19
