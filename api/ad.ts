var request = require('request');
// request.debug = true;

var env = require('dotenv');
env.config();

class Token {
    public value: string = null;
    public expires = Date.now()

    constructor(protected clientId: string, protected clientSecret: string) { }

    public acquire(next: (Error, Token) => void): void {
        let that = this;
        if (this.value && this.expires > Date.now()) {
            next(null, that);
        } else if (this.clientId && this.clientSecret) {
            request.post(
                {
                    url: 'https://login.microsoftonline.com/shew.net/oauth2/token',
                    json: true,
                    form: {
                        'grant_type': 'client_credentials',
                        'client_id': this.clientId,
                        'client_secret': this.clientSecret,
                        'resource': 'https://graph.microsoft.com'
                    }
                }, (err, response, body) => {
                    let result = body; // JSON.parse(body);
                    console.log('Response ' + JSON.stringify(body));
                    if (err || result == null) { next(err, null); return; }
                    that.value = (result.access_token) ? result.access_token : null;
                    that.expires = (result.expires_on) ? (parseInt(result.expires_on)*1000) : Date.now();
                    next(null, that);
                });
        } else {
            next('Unable to acquire', null);
        }
    }
}

class SimpleGraph
{
    constructor(protected token : string) { }

    static groupUrl =  "https://graph.microsoft.com/v1.0/groups?$filter=[predicate]&$select=id"
    groupIdsFromNames(names: string[], next : (err: Error, result: any[]) => void) {
        let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');        
        let url = `https://graph.microsoft.com/v1.0/groups?$filter=${predicate}&$select=id,displayName`;
        console.log(url);
        request({ 
            url: url, json: true, 
            headers: { Authorization: "Bearer " + this.token } }, (error, message, result) => {
            if (error) return next(error, null);
            console.log(result);
            next(null,result.value);
        });
    }
}

var token = new Token(process.env.ClientId, process.env.ClientSecret);
token.acquire((e : Error,t : Token) => {
    console.log('Got token ' + t.value);
        var graph = new SimpleGraph(t.value);
        graph.groupIdsFromNames(["Test"], (e, r ) => { 
        console.log('Got groups [' + r.map((v) => JSON.stringify(v)).join(', ') + ']');
    });
});

