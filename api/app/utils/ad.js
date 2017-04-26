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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LE1BQU0sQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFWSxVQUFVOztZQUNuQixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUNELEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakUsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFqQ0Qsb0RBaUNDIiwiZmlsZSI6ImFwcC91dGlscy9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2luZGV4LmQudHNcIiAvPlxyXG5cclxuaW1wb3J0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0JylcclxuaW1wb3J0IHVybCA9IHJlcXVpcmUoJ3VybCcpO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJlc291cmNlR3JhcGggID0gJ2h0dHBzOi8vZ3JhcGgubWljcm9zb2Z0LmNvbSc7XHJcbmV4cG9ydCBjb25zdCBSZXNvdXJjZUFSTSAgICA9ICdodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRva2VuIHtcclxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nID0gbnVsbDtcclxuICAgIHB1YmxpYyBleHBpcmVzID0gRGF0ZS5ub3coKVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCB0ZW5hbnQ6IHN0cmluZywgcHJvdGVjdGVkIGNsaWVudElkOiBzdHJpbmcsIHByb3RlY3RlZCBjbGllbnRTZWNyZXQ6IHN0cmluZykgeyB9XHJcblxyXG4gICAgcHVibGljIGFjcXVpcmUoZ3JhbnRfdHlwZTogc3RyaW5nLCByZXNvdXJjZTogc3RyaW5nLCBleHRyYVBhcmFtczogKHBhcmFtcykgPT4gYW55LCBuZXh0OiAoRXJyb3IsIFRva2VuKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy5leHBpcmVzID4gRGF0ZS5ub3coKSkge1xyXG4gICAgICAgICAgICBuZXh0KG51bGwsIHRoaXMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jbGllbnRJZCAmJiB0aGlzLmNsaWVudFNlY3JldCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICdncmFudF90eXBlJzogZ3JhbnRfdHlwZSxcclxuICAgICAgICAgICAgICAgICdjbGllbnRfaWQnOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgJ2NsaWVudF9zZWNyZXQnOiB0aGlzLmNsaWVudFNlY3JldCxcclxuICAgICAgICAgICAgICAgICdyZXNvdXJjZSc6IHJlc291cmNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChleHRyYVBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGV4dHJhUGFyYW1zKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlcXVlc3QucG9zdChcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vJHt0aGlzLnRlbmFudH0vb2F1dGgyL3Rva2VuYCxcclxuICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGRhdGFcclxuICAgICAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGJvZHk7IC8vIEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyciB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDQwMCB8fCByZXN1bHQgPT0gbnVsbCkgeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dChlcnIgfHwgcmVzdWx0LCBudWxsKTsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSAocmVzdWx0LmFjY2Vzc190b2tlbikgPyByZXN1bHQuYWNjZXNzX3Rva2VuIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGlyZXMgPSAocmVzdWx0LmV4cGlyZXNfb24pID8gcGFyc2VJbnQocmVzdWx0LmV4cGlyZXNfb24pICogMTAwMCA6IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dChudWxsLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHQoJ1VuYWJsZSB0byBhY3F1aXJlIGFjY2VzcyB0b2tlbicsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW4ocmVzb3VyY2U6IHN0cmluZyA9IFJlc291cmNlR3JhcGgpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hY3F1aXJlKCdjbGllbnRfY3JlZGVudGlhbHMnLCByZXNvdXJjZSwgbnVsbCwgKGVyciwgdG9rZW4pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRva2VuLnZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQmVoYWxmT2ZUb2tlbih1c2VyVG9rZW46IHN0cmluZywgcmVzb3VyY2U6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFjcXVpcmUoJ3VybjppZXRmOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmp3dC1iZWFyZXInLCByZXNvdXJjZSwgXHJcbiAgICAgICAgICAgICAgICAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbJ2Fzc2VydGlvbiddID0gdXNlclRva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbJ3JlcXVlc3RlZF90b2tlbl91c2UnXSA9ICdvbl9iZWhhbGZfb2YnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbJ3Njb3BlJ10gPSAnb3BlbmlkJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgKGVyciwgdG9rZW4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0b2tlbi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYmVhcmVyVG9rZW4odG9rZW5SZXF1ZXN0b3I6ICgpID0+IFByb21pc2U8c3RyaW5nPiA9IG51bGwpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdG9rZW5SZXF1ZXN0b3IpIHtcclxuICAgICAgICAgICAgdG9rZW5SZXF1ZXN0b3IgPSAoKSA9PiB0aGlzLmFjY2Vzc1Rva2VuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBcIkJlYXJlciBcIiArIGF3YWl0IHRva2VuUmVxdWVzdG9yKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR3JhcGhVc2VyIHtcclxuICAgIG9iamVjdElkOiBzdHJpbmdcclxuICAgIHVzZXJQcmluY2lwYWxOYW1lOiBzdHJpbmdcclxuICAgIGZ1bGxOYW1lOiBzdHJpbmdcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNpbXBsZUdyYXBoXHJcbntcclxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBhY2Nlc3NUb2tlbjogVG9rZW4pIHsgfVxyXG5cclxuICAgIHN0YXRpYyBiYXNlT3JpZ2luICAgPSBcImh0dHBzOi8vZ3JhcGgubWljcm9zb2Z0LmNvbS9cIjtcclxuICAgIHN0YXRpYyBiYXNlVXJpICAgICAgPSBTaW1wbGVHcmFwaC5iYXNlT3JpZ2luICsgXCJ2MS4wL1wiO1xyXG5cclxuICAgIHB1YmxpYyBhc3luYyBncm91cElkc0Zyb21OYW1lcyhuYW1lczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcbiAgICAgICAgbGV0IHByZWRpY2F0ZSA9IG5hbWVzLm1hcCgodikgPT4gXCJkaXNwbGF5TmFtZStlcSsnXCIgKyBlbmNvZGVVUkkodikgKyBcIidcIikuam9pbignK29yKycpOyAgICAgICAgXHJcbiAgICAgICAgbGV0IHVybCA9IFNpbXBsZUdyYXBoLmJhc2VVcmkgKyBgZ3JvdXBzPyRmaWx0ZXI9JHtwcmVkaWNhdGV9JiRzZWxlY3Q9aWQsZGlzcGxheU5hbWVgO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldCh7dXJsOiB1cmx9LCAoYm9keSkgPT4gUHJvbWlzZS5yZXNvbHZlKCg8YW55W10+Ym9keS52YWx1ZSkubWFwKGdyb3VwID0+IGdyb3VwLmlkKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VySW5Hcm91cHModXBuOiBzdHJpbmcsIGdyb3VwSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvc3QoU2ltcGxlR3JhcGguYmFzZVVyaSArIGB1c2Vycy8ke3Vwbn0vY2hlY2tNZW1iZXJHcm91cHNgLCB7XHJcbiAgICAgICAgICAgIGdyb3VwSWRzOiBncm91cElkc1xyXG4gICAgICAgIH0sIChib2R5KSA9PiBQcm9taXNlLnJlc29sdmUoKDxzdHJpbmdbXT5ib2R5LnZhbHVlKS5sZW5ndGggPiAwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGdldFVzZXJNZW1iZXJzKGdyb3VwSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8R3JhcGhVc2VyW10+IHtcclxuICAgICAgICB2YXIgY2hlY2tlZEdyb3VwcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICAgIHZhciB1bmlxdWVVc2VycyA9IG5ldyBNYXA8c3RyaW5nLCBHcmFwaFVzZXI+KCk7XHJcbiAgICAgICAgLy8gVHJhbnNpdGl2ZWx5IGRldGVybWluZSB0aGUgbGlzdCBvZiB1c2VycyBmcm9tIHRoZSBsaXN0IG9mIGdyb3Vwc1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGdyb3VwSWRzLm1hcChncm91cElkID0+IHRoaXMuZ3JvdXBVc2VyTWVtYmVycyhncm91cElkLCB1bmlxdWVVc2VycywgY2hlY2tlZEdyb3VwcykpKTtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWVVc2Vycy52YWx1ZXMoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHNlYXJjaEdyb3VwcyhzZWFyY2hUZXJtOiBzdHJpbmcsIGxpbWl0OiBudW1iZXIgPSAxNSk6IFByb21pc2U8YW55W10+IHtcclxuICAgICAgICB2YXIgZ3JvdXBzID0gYXdhaXQgdGhpcy5nZXRVcmwoU2ltcGxlR3JhcGguYmFzZVVyaSArIGBncm91cHM/JGZpbHRlcj1zdGFydHN3aXRoKGRpc3BsYXlOYW1lLCcke3NlYXJjaFRlcm19JykmJHRvcD0ke2xpbWl0fSYkZXhwYW5kPW93bmVyc2AsIGFzeW5jIGJvZHkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJvZHkudmFsdWUubWFwKGdyb3VwID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGdyb3VwLmRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIG93bmVyczogZ3JvdXAub3duZXJzLm1hcChvd25lciA9PiBvd25lci5kaXNwbGF5TmFtZSlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBncm91cHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBncm91cFVzZXJNZW1iZXJzKGdyb3VwSWQ6IHN0cmluZywgdXNlcnM6IE1hcDxzdHJpbmcsIEdyYXBoVXNlcj4sIGdyb3Vwc0NoZWNrZWQ6IFNldDxzdHJpbmc+KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5nZXRVcmwoU2ltcGxlR3JhcGguYmFzZVVyaSArIGBncm91cHMvJHtncm91cElkfS9tZW1iZXJzYCwgYXN5bmMgYm9keSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBtZW1iZXJzID0gPGFueVtdPmJvZHkudmFsdWU7XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgb3VyIHVzZXJzXHJcbiAgICAgICAgICAgIG1lbWJlcnNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIobWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtYmVyW1wiQG9kYXRhLnR5cGVcIl0gPT0gJyNtaWNyb3NvZnQuZ3JhcGgudXNlcic7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZvckVhY2gobWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB1c2Vycy5zZXQobWVtYmVyLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdElkOiBtZW1iZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJQcmluY2lwYWxOYW1lOiBtZW1iZXIudXNlclByaW5jaXBhbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiBtZW1iZXIuZGlzcGxheU5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBUcmF2ZXJzZSBpbnRvIGdyb3Vwc1xyXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChtZW1iZXJzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8U3RyaW5nPm1lbWJlcltcIkBvZGF0YS50eXBlXCJdKS5pbmRleE9mKCdncm91cCcpICE9IC0xICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICFncm91cHNDaGVja2VkLmhhcyhtZW1iZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5tYXAoYXN5bmMgbWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBncm91cHNDaGVja2VkLmFkZChtZW1iZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdyb3VwVXNlck1lbWJlcnMobWVtYmVyLmlkLCB1c2VycywgZ3JvdXBzQ2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldFVybDxUPih1cmw6IHN0cmluZywgcHJvY2Vzc1Jlc3VsdDogKGJvZHkpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRfcmVlbnRyYW50KHVybCwgbnVsbCwgcHJvY2Vzc1Jlc3VsdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldDxUPihvcHRpb25zOiByZXF1ZXN0Lk9wdGlvbnNXaXRoVXJsLCBwcm9jZXNzUmVzdWx0OiAoYm9keSkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldF9yZWVudHJhbnQob3B0aW9ucy51cmwsIG9wdGlvbnMsIHByb2Nlc3NSZXN1bHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgZ2V0X3JlZW50cmFudDxUPih1cmw6IHN0cmluZyB8IHVybC5VcmwsIG9wdGlvbnM6IHJlcXVlc3QuT3B0aW9uc1dpdGhVcmwsIHByb2Nlc3NSZXN1bHQ6IChib2R5KSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7dXJsOiB1cmx9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh1cmwpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy51cmwgPSB1cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbnMuanNvbiA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0ge31cclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzW1wiQXV0aG9yaXphdGlvblwiXSA9IGF3YWl0IHRoaXMuYWNjZXNzVG9rZW4uYmVhcmVyVG9rZW4oKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0LmdldChvcHRpb25zLCBhc3luYyAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSBpZiB3ZSBnb3QgYW4gZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVzb2x2ZUVycm9yKGVycm9yLCByZXNwb25zZSwgYm9keSwgcmVqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0cyA9IGF3YWl0IHByb2Nlc3NSZXN1bHQoYm9keSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBwYWdpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJvZHkuaGFzT3duUHJvcGVydHkoXCJAb2RhdGEubmV4dExpbmtcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlY3Vyc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlZFJlc3VsdHMgPSBhd2FpdCB0aGlzLmdldF9yZWVudHJhbnQoYm9keVtcIkBvZGF0YS5uZXh0TGlua1wiXSwgb3B0aW9ucywgcHJvY2Vzc1Jlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHRzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSA8VD48YW55Pig8YW55W10+cmVzdWx0cykuY29uY2F0KHBhZ2VkUmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhc3luYyBwb3N0PFQ+KHVybDogc3RyaW5nLCBib2R5OiBhbnksIHByb2Nlc3NSZXN1bHQ6IChib2R5KSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgbGV0IHRva2VuID0gYXdhaXQgdGhpcy5hY2Nlc3NUb2tlbi5iZWFyZXJUb2tlbigpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3QucG9zdCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogdG9rZW5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5XHJcbiAgICAgICAgICAgIH0sIGFzeW5jIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlIGlmIHdlIGdvdCBhbiBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5yZXNvbHZlRXJyb3IoZXJyb3IsIHJlc3BvbnNlLCBib2R5LCByZWplY3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYXdhaXQgcHJvY2Vzc1Jlc3VsdChib2R5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlc29sdmVFcnJvcihlcnJvcjogYW55LCByZXNwb25zZTogcmVxdWVzdC5SZXF1ZXN0UmVzcG9uc2UsIGJvZHk6IGFueSwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gNDAwKSB7XHJcbiAgICAgICAgICAgIHJlamVjdChib2R5LmVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaEdyb3VwTWVtYmVyc2hpcCB7XHJcbiAgICBwcm90ZWN0ZWQgZ3JhcGg6IFNpbXBsZUdyYXBoO1xyXG4gICAgcHJvdGVjdGVkIGdyb3VwSWRzOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIGdyb3VwTmFtZXM6IHN0cmluZ1tdLCB0b2tlbjogVG9rZW4pIHtcclxuICAgICAgICB0aGlzLmdyYXBoID0gbmV3IFNpbXBsZUdyYXBoKHRva2VuKTtcclxuICAgICAgICB0aGlzLmdyb3VwSWRzID0gdGhpcy5ncmFwaC5ncm91cElkc0Zyb21OYW1lcyhncm91cE5hbWVzKVxyXG4gICAgICAgICAgICAuY2F0Y2goZXggPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvb2t1cCBncm91cCBpZHMgZm9yIGdyb3VwczogJXMuIERldGFpbHM6ICVzJywgZ3JvdXBOYW1lcywgZXgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgaXNVc2VyTWVtYmVyKHVwbjogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGdyb3VwcyA9IGF3YWl0IHRoaXMuZ3JvdXBJZHM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdyYXBoLnVzZXJJbkdyb3Vwcyh1cG4sIGdyb3Vwcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBjaGVjayB1c2VyOiAlcyBtZW1iZXJzaGlwLiBEZXRhaWxzOiAlcycsIHVwbiwgZXgpO1xyXG4gICAgICAgICAgICB0aHJvdyBleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGdldE1lbWJlcnMoKTogUHJvbWlzZTxHcmFwaFVzZXJbXT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBncm91cHMgPSBhd2FpdCB0aGlzLmdyb3VwSWRzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncmFwaC5nZXRVc2VyTWVtYmVycyhncm91cHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gZ2V0IHVzZXIgbWVtYmVycyBsaXN0LiBEZXRhaWxzOiAlcycsIGV4KTtcclxuICAgICAgICAgICAgdGhyb3cgZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
