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
;
//# sourceMappingURL=apitests.js.map