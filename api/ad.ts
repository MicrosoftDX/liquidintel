/// <reference path="typings/index.d.ts" />

var request = require('request')

export class Token {
    public value: string = null;
    public expires = Date.now()

    constructor(protected tenant: string, protected clientId: string, protected clientSecret: string) { }

    public acquire(next: (Error, Token) => void): void {
        if (this.value && this.expires > Date.now()) {
            next(null, this);
        } else if (this.clientId && this.clientSecret) {
            request.post(
                {
                    url: `https://login.microsoftonline.com/${this.tenant}/oauth2/token`,
                    json: true,
                    form: {
                        'grant_type': 'client_credentials',
                        'client_id': this.clientId,
                        'client_secret': this.clientSecret,
                        'resource': 'https://graph.microsoft.com'
                    }
                }, (err, response, body) => {
                    let result = body; // JSON.parse(body);
                    //console.log('Response ' + JSON.stringify(body));
                    if (err || result == null) { next(err, null); return; }
                    this.value = (result.access_token) ? result.access_token : null;
                    this.expires = (result.expires_on) ? parseInt(result.expires_on)*1000 : Date.now();
                    next(null, this);
                });
        } else {
            next('Unable to acquire', null);
        }
    }
}

export class SimpleGraph
{
    constructor() { }

    static baseUri =  "https://graph.microsoft.com/v1.0/"

    groupIdsFromNames(names: string[], token: string, next : (err: Error, result: any[]) => void) {
        let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');        
        let url = SimpleGraph.baseUri + `groups?$filter=${predicate}&$select=id,displayName`;
        //console.log(url);
        request({ 
                url: url, 
                json: true, 
                headers: { Authorization: "Bearer " + token } 
            }, 
            (error, message, result) => {
                if (error) return next(error, null);
                console.log(names);
                console.log(result);
                next(null,result.value);
            });
    }

    isUserMemberOfAnyGroups(upn: string, groupIds: string[], token: string, next: (err: Error, result: boolean) => void) {
        request.post({
                url: SimpleGraph.baseUri + `users/${upn}/checkMemberGroups`,
                json: true,
                headers: { Authorization: "Bearer " + token }, 
                body: {
                    "groupIds": groupIds
                }
            }, (error, response, body) => {
                if (error) {
                    next(error, false);
                }
                else {
                    next(null, (<string[]>body.value).length > 0);
                }
            });
    }
}

export class GraphGroupMembership extends SimpleGraph {
    protected groupIds: string[];
    
    constructor(protected groupNames: string[], protected token: Token) { 
        super();
    }

    isUserMember(upn: string, next: (err: Error, result: boolean) => void) {
        this.getGroupIds((err, groupIds) => {
            if (err) {
                next(err, null);
            }
            else {
                this.token.acquire((err, token) => {
                    if (err) {
                        next(err, null);
                    }
                    else {
                        super.isUserMemberOfAnyGroups(upn, groupIds, token.value, (err, result) => {
                            next(err, result);
                        });
                    }
                });
            }
        });
    }

    protected getGroupIds(next : (err: Error, result: any[]) => void) {
        if (this.groupIds) {
            next(null, this.groupIds);
        }
        else {
            this.token.acquire((err, token) => {
                if (err) {
                    next(err, null);
                }
                else {
                    super.groupIdsFromNames(this.groupNames, this.token.value, (err, result) => {
                        if (err) {
                            next(err, null);
                        }
                        else {
                            this.groupIds = result.map(item => item.id);
                            next(null, this.groupIds);
                        }
                    });
                }
            });
        }
    }
}