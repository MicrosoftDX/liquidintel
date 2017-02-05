var request = require('request');
var env = require('dotenv');
env.config();
var Token = (function () {
    function Token(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.value = null;
        this.expires = Date.now();
    }
    Token.prototype.aquire = function (next) {
        var that = this;
        if (this.value && this.expires > Date.now()) {
            next(null, that);
        }
        else if (this.clientId && this.clientSecret) {
            request.post({
                url: 'https://login.microsoftonline.com/shew.net/oauth2/token',
                form: {
                    'grant_type': 'client_credentials',
                    'client_id': this.clientId,
                    'client_secret': this.clientSecret,
                    'resource': 'https://graph.microsoft.com'
                }
            }, function (err, response, body) {
                var result = JSON.parse(body);
                if (err || result == null) {
                    next(err, null);
                    return;
                }
                that.value = (result.access_token) ? result.access_token : null;
                that.expires = (result.expires_on) ? (parseInt(result.expires_on) * 1000) : Date.now();
                next(null, that);
            });
        }
        else {
            next('Unable to aquire', null);
        }
    };
    return Token;
}());
var Graph = (function () {
    function Graph(token) {
        this.token = token;
    }
    Graph.prototype.get = function (url, done) {
    };
    return Graph;
}());
var token = new Token(process.env.ClientId, process.env.ClientSecret);
token.aquire(function (err, t) {
    console.log(t.value);
});
//# sourceMappingURL=ad.js.map