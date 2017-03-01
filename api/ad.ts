/// <reference path="typings/index.d.ts" />

import request = require('request')

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
                    if (err || result == null) { 
                        next(err, null); return; 
                    }
                    this.value = (result.access_token) ? result.access_token : null;
                    this.expires = (result.expires_on) ? parseInt(result.expires_on) * 1000 : Date.now();
                    next(null, this);
                });
        } else {
            next('Unable to acquire access token', null);
        }
    }

    public accessToken(): Promise<String> {
        return new Promise<string>((resolve, reject) => {
            this.acquire((err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token.value);
            });
        });
    }
}

export class SimpleGraph
{
    constructor(protected accessToken: Token) { }

    static baseUri =  "https://graph.microsoft.com/v1.0/"

    public groupIdsFromNames(names: string[]): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.groupsFromNames(names, (err, groups) => {
                if (err) {
                    return reject(err);
                }
                resolve(groups.map((v) => v.id));
            });
        });
    }

    public userInGroups(upn: string, groupIds: string[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => { 
            this.memberOf(upn, groupIds, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    protected async groupsFromNames(names: string[], next : (err: Error, result: any[]) => void) {
        let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');        
        let url = SimpleGraph.baseUri + `groups?$filter=${predicate}&$select=id,displayName`;

        //console.log(url);
        let token = await this.accessToken.accessToken();
        request({ 
                url: url, 
                json: true, 
                headers: { Authorization: "Bearer " + token } 
            }, 
            (error, message, result) => {

                if (error) {
                    return next(error, null);
                }
                //console.log(result);
                next(null, result.value);
            });
    }

    protected async memberOf(upn: string, groupIds: string[], next: (err: Error, result: boolean) => void) {
        let token = await this.accessToken.accessToken();
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
                else if (response.statusCode >= 400) {
                    next(body.error, false);
                }
                else {
                    next(null, (<string[]>body.value).length > 0);
                }
            });
    }
}

export class GraphGroupMembership {
    protected graph: SimpleGraph;
    protected groupIds: Promise<string[]>;
    
    constructor(protected groupNames: string[], token: Token) {
        try {
            this.graph = new SimpleGraph(token);
            this.groupIds = this.graph.groupIdsFromNames(groupNames);
        }
        catch (ex) {
            console.error('Failed to lookup group ids for groups: %s. Details: %s', groupNames, ex);
        }
    }

    public async isUserMember(upn: string): Promise<boolean> {
        try {
            let groups = await this.groupIds;
            return this.graph.userInGroups(upn, groups);
        }
        catch (ex) {
            console.warn('Failed to check user: %s membership. Details: %s', upn, ex);
            throw ex;
        }
    }
}