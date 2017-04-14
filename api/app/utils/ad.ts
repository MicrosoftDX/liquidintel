/// <reference path="../../typings/index.d.ts" />

import request = require('request')
import url = require('url');

export const ResourceGraph  = 'https://graph.microsoft.com';
export const ResourceARM    = 'https://management.core.windows.net/';

export class Token {
    public value: string = null;
    public expires = Date.now()

    constructor(protected tenant: string, protected clientId: string, protected clientSecret: string) { }

    public acquire(grant_type: string, resource: string, extraParams: (params) => any, next: (Error, Token) => void): void {
        if (this.value && this.expires > Date.now()) {
            next(null, this);
        } else if (this.clientId && this.clientSecret) {
            var data = {
                'grant_type': grant_type,
                'client_id': this.clientId,
                'client_secret': this.clientSecret,
                'resource': resource
            };
            if (extraParams) {
                data = extraParams(data);
            }
            request.post(
                {
                    url: `https://login.microsoftonline.com/${this.tenant}/oauth2/token`,
                    json: true,
                    form: data
                }, (err, response, body) => {
                    let result = body; // JSON.parse(body);
                    if (err || response.statusCode >= 400 || result == null) { 
                        next(err || result, null); 
                        return; 
                    }
                    this.value = (result.access_token) ? result.access_token : null;
                    this.expires = (result.expires_on) ? parseInt(result.expires_on) * 1000 : Date.now();
                    next(null, this);
                });
        } else {
            next('Unable to acquire access token', null);
        }
    }

    public accessToken(resource: string = ResourceGraph): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.acquire('client_credentials', resource, null, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token.value);
            });
        });
    }

    public onBehalfOfToken(userToken: string, resource: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.acquire('urn:ietf:params:oauth:grant-type:jwt-bearer', resource, 
                (data) => {
                    data['assertion'] = userToken;
                    data['requested_token_use'] = 'on_behalf_of';
                    data['scope'] = 'openid';
                    return data;
                }, 
                (err, token) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(token.value);
                });
        });
    }

    public async bearerToken(tokenRequestor: () => Promise<string> = null): Promise<string> {
        if (!tokenRequestor) {
            tokenRequestor = () => this.accessToken();
        }
        return "Bearer " + await tokenRequestor();
    }
}

export interface GraphUser {
    objectId: string
    userPrincipalName: string
    fullName: string
}

export class SimpleGraph
{
    constructor(protected accessToken: Token) { }

    static baseOrigin   = "https://graph.microsoft.com/";
    static baseUri      = SimpleGraph.baseOrigin + "v1.0/";

    public async groupIdsFromNames(names: string[]): Promise<string[]> {
        let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');        
        let url = SimpleGraph.baseUri + `groups?$filter=${predicate}&$select=id,displayName`;
        return await this.get({url: url}, (body) => Promise.resolve((<any[]>body.value).map(group => group.id)));
    }

    public userInGroups(upn: string, groupIds: string[]): Promise<boolean> {
        return this.post(SimpleGraph.baseUri + `users/${upn}/checkMemberGroups`, {
            groupIds: groupIds
        }, (body) => Promise.resolve((<string[]>body.value).length > 0));
    }

    public async getUserMembers(groupIds: string[]): Promise<GraphUser[]> {
        var checkedGroups = new Set<string>();
        var uniqueUsers = new Map<string, GraphUser>();
        // Transitively determine the list of users from the list of groups
        await Promise.all(groupIds.map(groupId => this.groupUserMembers(groupId, uniqueUsers, checkedGroups)));
        return Array.from(uniqueUsers.values());
    }

    public async searchGroups(searchTerm: string, limit: number = 15): Promise<any[]> {
        var groups = await this.getUrl(SimpleGraph.baseUri + `groups?$filter=startswith(displayName,'${searchTerm}')&$top=${limit}&$expand=owners`, async body => {
            return Promise.resolve(body.value.map(group => {
                return {
                    displayName: group.displayName,
                    owners: group.owners.map(owner => owner.displayName)
                };
            }))
        });
        return groups;
    }

    private async groupUserMembers(groupId: string, users: Map<string, GraphUser>, groupsChecked: Set<string>): Promise<void> {
        await this.getUrl(SimpleGraph.baseUri + `groups/${groupId}/members`, async body => {
            let members = <any[]>body.value;
            // Process our users
            members
                .filter(member => {
                    return member["@odata.type"] == '#microsoft.graph.user';
                })
                .forEach(member => {
                    users.set(member.id, {
                        objectId: member.id,
                        userPrincipalName: member.userPrincipalName,
                        fullName: member.displayName
                    });
                });
            // Traverse into groups
            await Promise.all(members
                .filter(member => {
                    return (<String>member["@odata.type"]).indexOf('group') != -1 &&
                           !groupsChecked.has(member.id);
                })
                .map(async member => {
                    groupsChecked.add(member.id);
                    return this.groupUserMembers(member.id, users, groupsChecked);
                }));
        });
    }

    protected getUrl<T>(url: string, processResult: (body) => Promise<T>): Promise<T> {
        return this.get_reentrant(url, null, processResult);
    }

    protected get<T>(options: request.OptionsWithUrl, processResult: (body) => Promise<T>): Promise<T> {
        return this.get_reentrant(options.url, options, processResult);
    }

    private async get_reentrant<T>(url: string | url.Url, options: request.OptionsWithUrl, processResult: (body) => Promise<T>): Promise<T> {
        if (!options) {
            options = {url: url};
        }
        else if (url) {
            options.url = url;
        }
        options.json = true;
        if (!options.headers) {
            options.headers = {}
        }
        options.headers["Authorization"] = await this.accessToken.bearerToken();
        return new Promise<T>((resolve, reject) => {
            request.get(options, async (error, response, body) => {
                try {
                    // See if we got an error
                    if (!this.resolveError(error, response, body, reject)) {
                        var results = await processResult(body);
                        // Check for paging
                        if (body.hasOwnProperty("@odata.nextLink")) {
                            // Recurse
                            let pagedResults = await this.get_reentrant(body["@odata.nextLink"], options, processResult);
                            if (Array.isArray(results)) {
                                results = <T><any>(<any[]>results).concat(pagedResults);
                            }
                        }
                        resolve(results);
                    }
                }
                catch (ex) {
                    reject(ex);
                }
            })
        });
    }

    protected async post<T>(url: string, body: any, processResult: (body) => Promise<T>): Promise<T> {
        let token = await this.accessToken.bearerToken();
        return new Promise<T>((resolve, reject) => {
            request.post({
                url: url,
                json: true,
                headers: {
                    Authorization: token
                },
                body: body
            }, async (error, response, body) => {
                try {
                    // See if we got an error
                    if (!this.resolveError(error, response, body, reject)) {
                        resolve(await processResult(body));
                    }
                }
                catch (ex) {
                    reject(ex);
                }
            })
        });
    }

    private resolveError(error: any, response: request.RequestResponse, body: any, reject: (reason?: any) => void): boolean {
        if (error) {
            reject(error);
        }
        else if (response.statusCode >= 400) {
            reject(body.error);
        }
        else {
            return false;
        }
        return true;
    }
}

export class GraphGroupMembership {
    protected graph: SimpleGraph;
    protected groupIds: Promise<string[]>;
    
    constructor(protected groupNames: string[], token: Token) {
        this.graph = new SimpleGraph(token);
        this.groupIds = this.graph.groupIdsFromNames(groupNames)
            .catch(ex => {
                console.error('Failed to lookup group ids for groups: %s. Details: %s', groupNames, ex);
            });
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

    public async getMembers(): Promise<GraphUser[]> {
        try {
            let groups = await this.groupIds;
            return this.graph.getUserMembers(groups);
        }
        catch (ex) {
            console.warn('Failed to get user members list. Details: %s', ex);
            throw ex;
        }
    }
}