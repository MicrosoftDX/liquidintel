var request = require('request');
var env = require('dotenv');
env.config();
request.post({
    url: 'https://login.microsoftonline.com/shew.net/oauth2/token',
    form: {
        'grant_type': 'client_credentials',
        'client_id': process.env.ClientId,
        'client_secret': process.env.ClientSecret,
        'resource': 'https://graph.microsoft.com'
    }
}, function (err, response, body) {
    console.log(body);
});
//# sourceMappingURL=ad.js.map