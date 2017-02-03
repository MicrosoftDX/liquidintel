var request = require('request');
var env = require('dotenv');
env.config();

class Token {
    public value: string = null;
    public expires = Date.now()

    constructor(protected clientId: string, protected clientSecret: string) { }

    public aquire(next: (Error, Token) => void): void {
        let that = this;
        if (this.value && this.expires > Date.now()) {
            next(null, that);
        } else if (this.clientId && this.clientSecret) {
            request.post(
                {
                    url: 'https://login.microsoftonline.com/shew.net/oauth2/token',
                    form: {
                        'grant_type': 'client_credentials',
                        'client_id': this.clientId,
                        'client_secret': this.clientSecret,
                        'resource': 'https://graph.microsoft.com'
                    }
                }, (err, response, body) => {
                    let result = JSON.parse(body);
                    if (err || result == null) { next(err, null); return; }
                    that.value = (result.access_token) ? result.access_token : null;
                    that.expires = (result.expires_on) ? (parseInt(result.expires_on)*1000) : Date.now();
                    next(null, that);
                });
        } else {
            next('Unable to aquire', null);
        }
    }
}


class Graph {
    constructor(protected token : string) {}
    public get(url: string, done : (Error, any) => void) {
    }

}


var token = new Token(process.env.ClientId, process.env.ClientSecret);
token.aquire((err,t)=>{ 
    console.log(t.value);
})

