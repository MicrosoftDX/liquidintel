var chai = require('chai');
var server = require('../server');

describe('testing api', function() {
    it('should respond to / on / GET', function(done) {
        chai.request(server)
        .get('/')
        .end(function(err, res){
            res.should.have.status(200);
            done();
        })
    });
    it('should list kegs on /kegs GET', function(done) {
        chai.request(server)
        .get('/kegs')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            done();
        })
    });
});