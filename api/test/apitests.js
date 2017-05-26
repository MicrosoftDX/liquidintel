"use strict";
require('mocha');
const chai = require("chai");
var chaiHttp = require('chai-http');
var server = require('../server').app;
chai.use(chaiHttp);
const request = require("request");
var should = chai.should();
var adminBearerToken;
var nonAdminBearerToken;
var newKegIdTapOne;
var newKegIdTapTwo;
var activityIds = [];
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
                    BeerDescription: 'This is a really nice, hoppy beer!'
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
                    newKegIdTapOne = res.body.KegId;
                    done();
                });
            });
            it('should add new keg with all attributes from Untappd regardless of what you pass into the body on /api/kegs POST', function (done) {
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
                    res.body.Name.should.equal('Trickster');
                    res.body.Brewery.should.equal('Black Raven Brewing Company');
                    res.body.BeerType.should.equal('IPA - American');
                    res.body.ABV.should.equal(6.9);
                    res.body.IBU.should.equal(70);
                    res.body.BeerDescription.should.not.be.empty;
                    newKegIdTapTwo = res.body.KegId;
                    done();
                });
            });
            it('should return a 400 error on invalid UntappdId on /api/kegs POST', function (done) {
                chai.request(server)
                    .post('/api/kegs')
                    .set('Authorization', 'Bearer ' + adminBearerToken)
                    .send({
                    UntappdId: 126131245
                })
                    .end((err, res) => {
                    res.should.have.status(400);
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
                it('should require adding kegSize when making previously installed keg current /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .set('Authorization', 'Bearer ' + adminBearerToken)
                        .send({
                        KegId: newKegIdTapOne
                    })
                        .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
                });
                it('should require kegId in the body when making previously installed keg current /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .set('Authorization', 'Bearer ' + adminBearerToken)
                        .send({
                        kegSize: 17000
                    })
                        .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
                });
                it('should make previously installed keg current /api/CurrentKeg/<id> PUT', function (done) {
                    chai.request(server)
                        .put('/api/CurrentKeg/1')
                        .set('Authorization', 'Bearer ' + adminBearerToken)
                        .send({
                        KegId: newKegIdTapOne,
                        KegSize: 17000
                    })
                        .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.TapId.should.equal(1);
                        res.body.KegId.should.equal(newKegIdTapOne);
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
                it('should make previously installed keg current for tap #2 /api/CurrentKeg/<id> PUT', function (done) {
                    var tapId = 2;
                    chai.request(server)
                        .put('/api/CurrentKeg/' + tapId)
                        .set('Authorization', 'Bearer ' + adminBearerToken)
                        .send({
                        KegId: newKegIdTapTwo,
                        KegSize: 17000
                    })
                        .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.TapId.should.equal(tapId);
                        res.body.KegId.should.equal(newKegIdTapTwo);
                        res.body.KegSize.should.equal(17000);
                        res.body.CurrentVolume.should.equal(17000);
                        res.body.Name.should.equal('Trickster');
                        res.body.Brewery.should.equal('Black Raven Brewing Company');
                        res.body.BeerType.should.equal('IPA - American');
                        res.body.ABV.should.equal(6.9);
                        res.body.IBU.should.equal(70);
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
                            res.body[0].should.have.property('UntappdCheckinId'),
                                res.body[0].should.have.property('UntappdBadgeName'),
                                res.body[0].should.have.property('UntappdBadgeImageURL');
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
                            res.body.should.have.property('UntappdCheckinId'),
                                res.body.should.have.property('UntappdBadgeName'),
                                res.body.should.have.property('UntappdBadgeImageURL');
                            done();
                        });
                    });
                    it('should add new activity on /api/activity POST', function (done) {
                        chai.request(server)
                            .post('/api/activity')
                            .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                            .send({
                            sessionTime: new Date().toISOString(),
                            personnelNumber: Number(process.env.AdminPersonnelNumber),
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
                            activityIds.push(tapOne.ActivityId);
                            activityIds.push(tapTwo.ActivityId);
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
                                    amount: 200
                                },
                                "2": {
                                    amount: 0
                                }
                            }
                        })
                            .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.an('array');
                            res.body.length.should.equal(1);
                            res.body[0].amount.should.equal(200);
                            done();
                        });
                    });
                    describe('Step 4: Validate that activity has reduced volume in keg', () => {
                        it('should have reduced keg volumne after activity /api/CurrentKeg GET', function (done) {
                            chai.request(server)
                                .get('/api/CurrentKeg/2')
                                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                                .end((err, res) => {
                                res.should.have.status(200);
                                res.body.KegSize.should.equal(17000);
                                res.body.CurrentVolume.should.equal(17000 - 210);
                                done();
                            });
                        });
                    });
                    describe('Step 5: Validate Untappd Checkin for both taps', () => {
                        it('should only checkin with the beer that has an untappd id on /api/activity', function (done) {
                            this.timeout(10000);
                            var counter = 0;
                            setTimeout(() => {
                                for (var activityId of activityIds) {
                                    chai.request(server)
                                        .get('/api/activity/' + activityId)
                                        .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                                        .end((err, res) => {
                                        res.should.have.status(200);
                                        res.should.be.json;
                                        res.body.should.have.property('UntappdId');
                                        res.body.should.have.property('UntappdCheckinId');
                                        if (!!res.body.UntappdId) {
                                            should.not.equal(res.body.UntappdCheckinId, null);
                                        }
                                        else {
                                            should.equal(res.body.UntappdCheckinId, null);
                                        }
                                        if (++counter >= activityIds.length) {
                                            done();
                                        }
                                    });
                                }
                            }, 5000);
                        });
                        it('should not checkin with untappd when the consumption is 0 ml on /api/activity', function (done) {
                            chai.request(server)
                                .post('/api/activity/')
                                .auth(process.env.BasicAuthUsername, process.env.BasicAuthPassword)
                                .send({
                                sessionTime: new Date().toISOString(),
                                personnelNumber: Number(process.env.AdminPersonnelNumber),
                                Taps: {
                                    "1": {
                                        amount: 0
                                    },
                                    "2": {
                                        amount: 0
                                    }
                                }
                            })
                                .end((err, res) => {
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.be.an('array');
                                res.body.length.should.equal(0);
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
            should.equal(res.body.UntappdAccessToken, undefined);
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
            res.should.have.status(200);
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
            UntappdUserName: process.env.NonAdminAlias,
            UntappdAccessToken: process.env.NonAdminUntappdAccessToken,
            CheckinFacebook: true,
            CheckinTwitter: false,
            CheckinFoursquare: true
        })
            .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('PersonnelNumber');
            res.body.PersonnelNumber.should.equal(Number(process.env.NonAdminPersonnelNumber));
            res.body.UntappdUserName.should.equal(process.env.NonAdminAlias);
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
//# sourceMappingURL=apitests.js.map