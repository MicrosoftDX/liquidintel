"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var request = require('request');
var Token = (function () {
    function Token(tenant, clientId, clientSecret) {
        this.tenant = tenant;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.value = null;
        this.expires = Date.now();
    }
    Token.prototype.acquire = function (next) {
        var _this = this;
        if (this.value && this.expires > Date.now()) {
            next(null, this);
        }
        else if (this.clientId && this.clientSecret) {
            request.post({
                url: "https://login.microsoftonline.com/" + this.tenant + "/oauth2/token",
                json: true,
                form: {
                    'grant_type': 'client_credentials',
                    'client_id': this.clientId,
                    'client_secret': this.clientSecret,
                    'resource': 'https://graph.microsoft.com'
                }
            }, function (err, response, body) {
                var result = body;
                console.log('Response ' + JSON.stringify(body));
                if (err || result == null) {
                    next(err, null);
                    return;
                }
                _this.value = (result.access_token) ? result.access_token : null;
                _this.expires = (result.expires_on) ? parseInt(result.expires_on) * 1000 : Date.now();
                next(null, _this);
            });
        }
        else {
            next('Unable to acquire', null);
        }
    };
    return Token;
}());
exports.Token = Token;
var SimpleGraph = (function () {
    function SimpleGraph() {
    }
    SimpleGraph.prototype.groupIdsFromNames = function (names, token, next) {
        var predicate = names.map(function (v) { return "displayName+eq+'" + encodeURI(v) + "'"; }).join('+or+');
        var url = SimpleGraph.baseUri + ("groups?$filter=" + predicate + "&$select=id,displayName");
        console.log(url);
        request({
            url: url,
            json: true,
            headers: { Authorization: "Bearer " + token }
        }, function (error, message, result) {
            if (error)
                return next(error, null);
            console.log(result);
            next(null, result.value);
        });
    };
    SimpleGraph.prototype.isUserMemberOfAnyGroups = function (upn, groupIds, token, next) {
        request.post({
            url: SimpleGraph.baseUri + ("users/" + upn + "/checkMemberGroups"),
            json: true,
            headers: { Authorization: "Bearer " + token },
            body: {
                "groupIds": groupIds
            }
        }, function (error, response, body) {
            if (error) {
                next(error, false);
            }
            else {
                next(null, body.value.length > 0);
            }
        });
    };
    return SimpleGraph;
}());
SimpleGraph.baseUri = "https://graph.microsoft.com/v1.0/";
exports.SimpleGraph = SimpleGraph;
var GraphGroupMembership = (function (_super) {
    __extends(GraphGroupMembership, _super);
    function GraphGroupMembership(groupNames, token) {
        var _this = _super.call(this) || this;
        _this.groupNames = groupNames;
        _this.token = token;
        return _this;
    }
    GraphGroupMembership.prototype.isUserMember = function (upn, next) {
        var _this = this;
        this.getGroupIds(function (err, groupIds) {
            if (err) {
                next(err, null);
            }
            else {
                _this.token.acquire(function (err, token) {
                    if (err) {
                        next(err, null);
                    }
                    else {
                        _super.prototype.isUserMemberOfAnyGroups.call(_this, upn, groupIds, token.value, function (err, result) {
                            next(err, result);
                        });
                    }
                });
            }
        });
    };
    GraphGroupMembership.prototype.getGroupIds = function (next) {
        var _this = this;
        if (this.groupIds) {
            next(null, this.groupIds);
        }
        else {
            this.token.acquire(function (err, token) {
                if (err) {
                    next(err, null);
                }
                else {
                    _super.prototype.groupIdsFromNames.call(_this, _this.groupNames, _this.token.value, function (err, result) {
                        if (err) {
                            next(err, null);
                        }
                        else {
                            _this.groupIds = result.map(function (item) { return item.id; });
                            next(null, _this.groupIds);
                        }
                    });
                }
            });
        }
    };
    return GraphGroupMembership;
}(SimpleGraph));
exports.GraphGroupMembership = GraphGroupMembership;
//# sourceMappingURL=ad.js.map