"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
exports.ResourceGraph = 'https://graph.microsoft.com';
exports.ResourceARM = 'https://management.core.windows.net/';
class Token {
    constructor(tenant, clientId, clientSecret) {
        this.tenant = tenant;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.value = null;
        this.expires = Date.now();
    }
    acquire(grant_type, resource, extraParams, next) {
        if (this.value && this.expires > Date.now()) {
            next(null, this);
        }
        else if (this.clientId && this.clientSecret) {
            var data = {
                'grant_type': grant_type,
                'client_id': this.clientId,
                'client_secret': this.clientSecret,
                'resource': resource
            };
            if (extraParams) {
                data = extraParams(data);
            }
            request.post({
                url: `https://login.microsoftonline.com/${this.tenant}/oauth2/token`,
                json: true,
                form: data
            }, (err, response, body) => {
                let result = body;
                if (err || response.statusCode >= 400 || result == null) {
                    next(err || result, null);
                    return;
                }
                this.value = (result.access_token) ? result.access_token : null;
                this.expires = (result.expires_on) ? parseInt(result.expires_on) * 1000 : Date.now();
                next(null, this);
            });
        }
        else {
            next('Unable to acquire access token', null);
        }
    }
    accessToken(resource = exports.ResourceGraph) {
        return new Promise((resolve, reject) => {
            this.acquire('client_credentials', resource, null, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token.value);
            });
        });
    }
    onBehalfOfToken(userToken, resource) {
        return new Promise((resolve, reject) => {
            this.acquire('urn:ietf:params:oauth:grant-type:jwt-bearer', resource, (data) => {
                data['assertion'] = userToken;
                data['requested_token_use'] = 'on_behalf_of';
                data['scope'] = 'openid';
                return data;
            }, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token.value);
            });
        });
    }
    bearerToken(tokenRequestor = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tokenRequestor) {
                tokenRequestor = () => this.accessToken();
            }
            return "Bearer " + (yield tokenRequestor());
        });
    }
}
exports.Token = Token;
class SimpleGraph {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    groupIdsFromNames(names) {
        return __awaiter(this, void 0, void 0, function* () {
            let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');
            let url = SimpleGraph.baseUri + `groups?$filter=${predicate}&$select=id,displayName`;
            return yield this.get({ url: url }, (body) => Promise.resolve(body.value.map(group => group.id)));
        });
    }
    userInGroups(upn, groupIds) {
        return this.post(SimpleGraph.baseUri + `users/${upn}/checkMemberGroups`, {
            groupIds: groupIds
        }, (body) => Promise.resolve(body.value.length > 0));
    }
    getUserMembers(groupIds) {
        return __awaiter(this, void 0, void 0, function* () {
            var checkedGroups = new Set();
            var uniqueUsers = new Map();
            yield Promise.all(groupIds.map(groupId => this.groupUserMembers(groupId, uniqueUsers, checkedGroups)));
            return Array.from(uniqueUsers.values());
        });
    }
    searchGroups(searchTerm, limit = 15) {
        return __awaiter(this, void 0, void 0, function* () {
            var groups = yield this.getUrl(SimpleGraph.baseUri + `groups?$filter=startswith(displayName,'${searchTerm}')&$top=${limit}&$expand=owners`, (body) => __awaiter(this, void 0, void 0, function* () {
                return Promise.resolve(body.value.map(group => {
                    return {
                        displayName: group.displayName,
                        owners: group.owners.map(owner => owner.displayName)
                    };
                }));
            }));
            return groups;
        });
    }
    groupUserMembers(groupId, users, groupsChecked) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getUrl(SimpleGraph.baseUri + `groups/${groupId}/members`, (body) => __awaiter(this, void 0, void 0, function* () {
                let members = body.value;
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
                yield Promise.all(members
                    .filter(member => {
                    return member["@odata.type"].indexOf('group') != -1 &&
                        !groupsChecked.has(member.id);
                })
                    .map((member) => __awaiter(this, void 0, void 0, function* () {
                    groupsChecked.add(member.id);
                    return this.groupUserMembers(member.id, users, groupsChecked);
                })));
            }));
        });
    }
    getUrl(url, processResult) {
        return this.get_reentrant(url, null, processResult);
    }
    get(options, processResult) {
        return this.get_reentrant(options.url, options, processResult);
    }
    get_reentrant(url, options, processResult) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options) {
                options = { url: url };
            }
            else if (url) {
                options.url = url;
            }
            options.json = true;
            if (!options.headers) {
                options.headers = {};
            }
            options.headers["Authorization"] = yield this.accessToken.bearerToken();
            return new Promise((resolve, reject) => {
                request.get(options, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (!this.resolveError(error, response, body, reject)) {
                            var results = yield processResult(body);
                            if (body.hasOwnProperty("@odata.nextLink")) {
                                let pagedResults = yield this.get_reentrant(body["@odata.nextLink"], options, processResult);
                                if (Array.isArray(results)) {
                                    results = results.concat(pagedResults);
                                }
                            }
                            resolve(results);
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }));
            });
        });
    }
    post(url, body, processResult) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.accessToken.bearerToken();
            return new Promise((resolve, reject) => {
                request.post({
                    url: url,
                    json: true,
                    headers: {
                        Authorization: token
                    },
                    body: body
                }, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (!this.resolveError(error, response, body, reject)) {
                            resolve(yield processResult(body));
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }));
            });
        });
    }
    resolveError(error, response, body, reject) {
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
SimpleGraph.baseOrigin = "https://graph.microsoft.com/";
SimpleGraph.baseUri = SimpleGraph.baseOrigin + "v1.0/";
exports.SimpleGraph = SimpleGraph;
class GraphGroupMembership {
    constructor(groupNames, token) {
        this.groupNames = groupNames;
        this.graph = new SimpleGraph(token);
        this.groupIds = this.graph.groupIdsFromNames(groupNames)
            .catch(ex => {
            console.error('Failed to lookup group ids for groups: %s. Details: %s', groupNames, ex);
        });
    }
    isUserMember(upn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let groups = yield this.groupIds;
                return this.graph.userInGroups(upn, groups);
            }
            catch (ex) {
                console.warn('Failed to check user: %s membership. Details: %s', upn, ex);
                throw ex;
            }
        });
    }
    getMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let groups = yield this.groupIds;
                return this.graph.getUserMembers(groups);
            }
            catch (ex) {
                console.warn('Failed to get user members list. Details: %s', ex);
                throw ex;
            }
        });
    }
}
exports.GraphGroupMembership = GraphGroupMembership;
//# sourceMappingURL=ad.js.map