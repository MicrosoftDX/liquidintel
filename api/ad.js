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
    Token.prototype.acquire = function (next) {
        var that = this;
        if (this.value && this.expires > Date.now()) {
            next(null, that);
        }
        else if (this.clientId && this.clientSecret) {
            request.post({
                url: 'https://login.microsoftonline.com/shew.net/oauth2/token',
                json: true,
                form: {
                    'grant_type': 'client_credentials',
                    'client_id': this.clientId,
                    'client_secret': this.clientSecret,
                    'resource': 'https://graph.microsoft.com'
                }
            }, function (err, response, body) {
                var result = body;
                console.log('Response ' + JSON.stringify(body));
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
            next('Unable to acquire', null);
        }
    };
    return Token;
}());
var SimpleGraph = (function () {
    function SimpleGraph(token) {
        this.token = token;
    }
    SimpleGraph.prototype.groupIdsFromNames = function (names, next) {
        var predicate = names.map(function (v) { return "displayName+eq+'" + encodeURI(v) + "'"; }).join('+or+');
        var url = "https://graph.microsoft.com/v1.0/groups?$filter=" + predicate + "&$select=id,displayName";
        console.log(url);
        request({
            url: url, json: true,
            headers: { Authorization: "Bearer " + this.token }
        }, function (error, message, result) {
            if (error)
                return next(error, null);
            console.log(result);
            next(null, result.value);
        });
    };
    return SimpleGraph;
}());
SimpleGraph.groupUrl = "https://graph.microsoft.com/v1.0/groups?$filter=[predicate]&$select=id";
var token = new Token(process.env.ClientId, process.env.ClientSecret);
token.acquire(function (e, t) {
    console.log('Got token ' + t.value);
    var graph = new SimpleGraph(t.value);
    graph.groupIdsFromNames(["Test"], function (e, r) {
        console.log('Got groups [' + r.map(function (v) { return JSON.stringify(v); }).join(', ') + ']');
    });
});
//# sourceMappingURL=ad.js.map