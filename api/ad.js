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
    bearerToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return "Bearer " + (yield this.accessToken());
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
SimpleGraph.baseUri = "https://graph.microsoft.com/v1.0/";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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cGluZ3MvaW5kZXguZC50c1wiIC8+XHJcblxyXG5pbXBvcnQgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKVxyXG5pbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJyk7XHJcblxyXG5leHBvcnQgY2xhc3MgVG9rZW4ge1xyXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcgPSBudWxsO1xyXG4gICAgcHVibGljIGV4cGlyZXMgPSBEYXRlLm5vdygpXHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIHRlbmFudDogc3RyaW5nLCBwcm90ZWN0ZWQgY2xpZW50SWQ6IHN0cmluZywgcHJvdGVjdGVkIGNsaWVudFNlY3JldDogc3RyaW5nKSB7IH1cclxuXHJcbiAgICBwdWJsaWMgYWNxdWlyZShuZXh0OiAoRXJyb3IsIFRva2VuKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy5leHBpcmVzID4gRGF0ZS5ub3coKSkge1xyXG4gICAgICAgICAgICBuZXh0KG51bGwsIHRoaXMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jbGllbnRJZCAmJiB0aGlzLmNsaWVudFNlY3JldCkge1xyXG4gICAgICAgICAgICByZXF1ZXN0LnBvc3QoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tLyR7dGhpcy50ZW5hbnR9L29hdXRoMi90b2tlbmAsXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmb3JtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdncmFudF90eXBlJzogJ2NsaWVudF9jcmVkZW50aWFscycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdjbGllbnRfaWQnOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnY2xpZW50X3NlY3JldCc6IHRoaXMuY2xpZW50U2VjcmV0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVzb3VyY2UnOiAnaHR0cHM6Ly9ncmFwaC5taWNyb3NvZnQuY29tJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGJvZHk7IC8vIEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnUmVzcG9uc2UgJyArIEpTT04uc3RyaW5naWZ5KGJvZHkpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyIHx8IHJlc3VsdCA9PSBudWxsKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KGVyciwgbnVsbCk7IHJldHVybjsgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSAocmVzdWx0LmFjY2Vzc190b2tlbikgPyByZXN1bHQuYWNjZXNzX3Rva2VuIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGlyZXMgPSAocmVzdWx0LmV4cGlyZXNfb24pID8gcGFyc2VJbnQocmVzdWx0LmV4cGlyZXNfb24pICogMTAwMCA6IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dChudWxsLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHQoJ1VuYWJsZSB0byBhY3F1aXJlIGFjY2VzcyB0b2tlbicsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWNxdWlyZSgoZXJyLCB0b2tlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUodG9rZW4udmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgYmVhcmVyVG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gXCJCZWFyZXIgXCIgKyBhd2FpdCB0aGlzLmFjY2Vzc1Rva2VuKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR3JhcGhVc2VyIHtcclxuICAgIG9iamVjdElkOiBzdHJpbmdcclxuICAgIHVzZXJQcmluY2lwYWxOYW1lOiBzdHJpbmdcclxuICAgIGZ1bGxOYW1lOiBzdHJpbmdcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNpbXBsZUdyYXBoXHJcbntcclxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBhY2Nlc3NUb2tlbjogVG9rZW4pIHsgfVxyXG5cclxuICAgIHN0YXRpYyBiYXNlVXJpID0gIFwiaHR0cHM6Ly9ncmFwaC5taWNyb3NvZnQuY29tL3YxLjAvXCJcclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgZ3JvdXBJZHNGcm9tTmFtZXMobmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgICAgIGxldCBwcmVkaWNhdGUgPSBuYW1lcy5tYXAoKHYpID0+IFwiZGlzcGxheU5hbWUrZXErJ1wiICsgZW5jb2RlVVJJKHYpICsgXCInXCIpLmpvaW4oJytvcisnKTsgICAgICAgIFxyXG4gICAgICAgIGxldCB1cmwgPSBTaW1wbGVHcmFwaC5iYXNlVXJpICsgYGdyb3Vwcz8kZmlsdGVyPSR7cHJlZGljYXRlfSYkc2VsZWN0PWlkLGRpc3BsYXlOYW1lYDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXQoe3VybDogdXJsfSwgKGJvZHkpID0+IFByb21pc2UucmVzb2x2ZSgoPGFueVtdPmJvZHkudmFsdWUpLm1hcChncm91cCA9PiBncm91cC5pZCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlckluR3JvdXBzKHVwbjogc3RyaW5nLCBncm91cElkczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0KFNpbXBsZUdyYXBoLmJhc2VVcmkgKyBgdXNlcnMvJHt1cG59L2NoZWNrTWVtYmVyR3JvdXBzYCwge1xyXG4gICAgICAgICAgICBncm91cElkczogZ3JvdXBJZHNcclxuICAgICAgICB9LCAoYm9keSkgPT4gUHJvbWlzZS5yZXNvbHZlKCg8c3RyaW5nW10+Ym9keS52YWx1ZSkubGVuZ3RoID4gMCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBnZXRVc2VyTWVtYmVycyhncm91cElkczogc3RyaW5nW10pOiBQcm9taXNlPEdyYXBoVXNlcltdPiB7XHJcbiAgICAgICAgdmFyIGNoZWNrZWRHcm91cHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgICAgICB2YXIgdW5pcXVlVXNlcnMgPSBuZXcgTWFwPHN0cmluZywgR3JhcGhVc2VyPigpO1xyXG4gICAgICAgIC8vIFRyYW5zaXRpdmVseSBkZXRlcm1pbmUgdGhlIGxpc3Qgb2YgdXNlcnMgZnJvbSB0aGUgbGlzdCBvZiBncm91cHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChncm91cElkcy5tYXAoZ3JvdXBJZCA9PiB0aGlzLmdyb3VwVXNlck1lbWJlcnMoZ3JvdXBJZCwgdW5pcXVlVXNlcnMsIGNoZWNrZWRHcm91cHMpKSk7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odW5pcXVlVXNlcnMudmFsdWVzKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgZ3JvdXBVc2VyTWVtYmVycyhncm91cElkOiBzdHJpbmcsIHVzZXJzOiBNYXA8c3RyaW5nLCBHcmFwaFVzZXI+LCBncm91cHNDaGVja2VkOiBTZXQ8c3RyaW5nPik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZ2V0VXJsKFNpbXBsZUdyYXBoLmJhc2VVcmkgKyBgZ3JvdXBzLyR7Z3JvdXBJZH0vbWVtYmVyc2AsIGFzeW5jIGJvZHkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbWVtYmVycyA9IDxhbnlbXT5ib2R5LnZhbHVlO1xyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG91ciB1c2Vyc1xyXG4gICAgICAgICAgICBtZW1iZXJzXHJcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbWJlcltcIkBvZGF0YS50eXBlXCJdID09ICcjbWljcm9zb2Z0LmdyYXBoLnVzZXInO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMuc2V0KG1lbWJlci5pZCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RJZDogbWVtYmVyLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyUHJpbmNpcGFsTmFtZTogbWVtYmVyLnVzZXJQcmluY2lwYWxOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsTmFtZTogbWVtYmVyLmRpc3BsYXlOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gVHJhdmVyc2UgaW50byBncm91cHNcclxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwobWVtYmVyc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcihtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoPFN0cmluZz5tZW1iZXJbXCJAb2RhdGEudHlwZVwiXSkuaW5kZXhPZignZ3JvdXAnKSAhPSAtMSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAhZ3JvdXBzQ2hlY2tlZC5oYXMobWVtYmVyLmlkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAubWFwKGFzeW5jIG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBzQ2hlY2tlZC5hZGQobWVtYmVyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ncm91cFVzZXJNZW1iZXJzKG1lbWJlci5pZCwgdXNlcnMsIGdyb3Vwc0NoZWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRVcmw8VD4odXJsOiBzdHJpbmcsIHByb2Nlc3NSZXN1bHQ6IChib2R5KSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0X3JlZW50cmFudCh1cmwsIG51bGwsIHByb2Nlc3NSZXN1bHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXQ8VD4ob3B0aW9uczogcmVxdWVzdC5PcHRpb25zV2l0aFVybCwgcHJvY2Vzc1Jlc3VsdDogKGJvZHkpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRfcmVlbnRyYW50KG9wdGlvbnMudXJsLCBvcHRpb25zLCBwcm9jZXNzUmVzdWx0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGdldF9yZWVudHJhbnQ8VD4odXJsOiBzdHJpbmcgfCB1cmwuVXJsLCBvcHRpb25zOiByZXF1ZXN0Lk9wdGlvbnNXaXRoVXJsLCBwcm9jZXNzUmVzdWx0OiAoYm9keSkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIGlmICghb3B0aW9ucykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge3VybDogdXJsfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodXJsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMudXJsID0gdXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb25zLmpzb24gPSB0cnVlO1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IHt9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1tcIkF1dGhvcml6YXRpb25cIl0gPSBhd2FpdCB0aGlzLmFjY2Vzc1Rva2VuLmJlYXJlclRva2VuKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVxdWVzdC5nZXQob3B0aW9ucywgYXN5bmMgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTZWUgaWYgd2UgZ290IGFuIGVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJlc29sdmVFcnJvcihlcnJvciwgcmVzcG9uc2UsIGJvZHksIHJlamVjdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCBwcm9jZXNzUmVzdWx0KGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgcGFnaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChib2R5Lmhhc093blByb3BlcnR5KFwiQG9kYXRhLm5leHRMaW5rXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWN1cnNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZWRSZXN1bHRzID0gYXdhaXQgdGhpcy5nZXRfcmVlbnRyYW50KGJvZHlbXCJAb2RhdGEubmV4dExpbmtcIl0sIG9wdGlvbnMsIHByb2Nlc3NSZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gPFQ+PGFueT4oPGFueVtdPnJlc3VsdHMpLmNvbmNhdChwYWdlZFJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgcG9zdDxUPih1cmw6IHN0cmluZywgYm9keTogYW55LCBwcm9jZXNzUmVzdWx0OiAoYm9keSkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xyXG4gICAgICAgIGxldCB0b2tlbiA9IGF3YWl0IHRoaXMuYWNjZXNzVG9rZW4uYmVhcmVyVG9rZW4oKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0LnBvc3Qoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IHRva2VuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxyXG4gICAgICAgICAgICB9LCBhc3luYyAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSBpZiB3ZSBnb3QgYW4gZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVzb2x2ZUVycm9yKGVycm9yLCByZXNwb25zZSwgYm9keSwgcmVqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGF3YWl0IHByb2Nlc3NSZXN1bHQoYm9keSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZXNvbHZlRXJyb3IoZXJyb3I6IGFueSwgcmVzcG9uc2U6IHJlcXVlc3QuUmVxdWVzdFJlc3BvbnNlLCBib2R5OiBhbnksIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID49IDQwMCkge1xyXG4gICAgICAgICAgICByZWplY3QoYm9keS5lcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGhHcm91cE1lbWJlcnNoaXAge1xyXG4gICAgcHJvdGVjdGVkIGdyYXBoOiBTaW1wbGVHcmFwaDtcclxuICAgIHByb3RlY3RlZCBncm91cElkczogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBncm91cE5hbWVzOiBzdHJpbmdbXSwgdG9rZW46IFRva2VuKSB7XHJcbiAgICAgICAgdGhpcy5ncmFwaCA9IG5ldyBTaW1wbGVHcmFwaCh0b2tlbik7XHJcbiAgICAgICAgdGhpcy5ncm91cElkcyA9IHRoaXMuZ3JhcGguZ3JvdXBJZHNGcm9tTmFtZXMoZ3JvdXBOYW1lcylcclxuICAgICAgICAgICAgLmNhdGNoKGV4ID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb29rdXAgZ3JvdXAgaWRzIGZvciBncm91cHM6ICVzLiBEZXRhaWxzOiAlcycsIGdyb3VwTmFtZXMsIGV4KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGlzVXNlck1lbWJlcih1cG46IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBncm91cHMgPSBhd2FpdCB0aGlzLmdyb3VwSWRzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ncmFwaC51c2VySW5Hcm91cHModXBuLCBncm91cHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gY2hlY2sgdXNlcjogJXMgbWVtYmVyc2hpcC4gRGV0YWlsczogJXMnLCB1cG4sIGV4KTtcclxuICAgICAgICAgICAgdGhyb3cgZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBnZXRNZW1iZXJzKCk6IFByb21pc2U8R3JhcGhVc2VyW10+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgZ3JvdXBzID0gYXdhaXQgdGhpcy5ncm91cElkcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ3JhcGguZ2V0VXNlck1lbWJlcnMoZ3JvdXBzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIGdldCB1c2VyIG1lbWJlcnMgbGlzdC4gRGV0YWlsczogJXMnLCBleCk7XHJcbiAgICAgICAgICAgIHRocm93IGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
