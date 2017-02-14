"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require("request");
class Token {
    constructor(tenant, clientId, clientSecret) {
        this.tenant = tenant;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.value = null;
        this.expires = Date.now();
    }
    acquire(next) {
        if (this.value && this.expires > Date.now()) {
            next(null, this);
        }
        else if (this.clientId && this.clientSecret) {
            request.post({
                url: `https://login.microsoftonline.com/${this.tenant}/oauth2/token`,
                json: true,
                form: {
                    'grant_type': 'client_credentials',
                    'client_id': this.clientId,
                    'client_secret': this.clientSecret,
                    'resource': 'https://graph.microsoft.com'
                }
            }, (err, response, body) => {
                let result = body;
                console.log('Response ' + JSON.stringify(body));
                if (err || result == null) {
                    next(err, null);
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
    accessToken() {
        return new Promise((resolve, reject) => {
            this.acquire((err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token.value);
            });
        });
    }
}
exports.Token = Token;
class SimpleGraph {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    groupIdsFromNames(names) {
        return new Promise((resolve, reject) => {
            this.groupsFromNames(names, (err, groups) => {
                if (err) {
                    return reject(err);
                }
                resolve(groups.map((v) => v.id));
            });
        });
    }
    userInGroups(upn, groupIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.memberOf(upn, groupIds, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });
    }
    groupsFromNames(names, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let predicate = names.map((v) => "displayName+eq+'" + encodeURI(v) + "'").join('+or+');
            let url = SimpleGraph.baseUri + `groups?$filter=${predicate}&$select=id,displayName`;
            console.log(url);
            let token = yield this.accessToken.accessToken();
            request({
                url: url,
                json: true,
                headers: { Authorization: "Bearer " + token }
            }, (error, message, result) => {
                if (error) {
                    return next(error, null);
                }
                console.log(result);
                next(null, result.value);
            });
        });
    }
    memberOf(upn, groupIds, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this.accessToken.accessToken();
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
                    next(null, body.value.length > 0);
                }
            });
        });
    }
}
SimpleGraph.baseUri = "https://graph.microsoft.com/v1.0/";
exports.SimpleGraph = SimpleGraph;
class GraphGroupMembership {
    constructor(groupNames, token) {
        this.groupNames = groupNames;
        this.graph = new SimpleGraph(token);
        this.groupIds = this.graph.groupIdsFromNames(groupNames);
    }
    isUserMember(upn) {
        return __awaiter(this, void 0, void 0, function* () {
            let groups = yield this.groupIds;
            return this.graph.userInGroups(upn, groups);
        });
    }
}
exports.GraphGroupMembership = GraphGroupMembership;
//# sourceMappingURL=ad.js.map