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
const aad = require("../utils/ad");
const settings = require("../utils/settings_encoder");
const request_promise = require("request-promise");
const azureWebsiteAppsettingsBaseUri = `https://management.azure.com/subscriptions/${process.env.WebsiteSubscription}/resourceGroups/${process.env.WebsiteResourceGroup}/providers/Microsoft.Web/sites/${process.env.WebsiteName}/slots/${process.env.WebsiteSlot}/config/appsettings`;
const azureWebsiteAppsettingsApiVersion = 'api-version=2016-08-01';
var graph = new aad.SimpleGraph(new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret));
function getAllowedGroups(queryParams, output, successStatus = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        if (queryParams && queryParams.search) {
            try {
                var groups = yield graph.searchGroups(queryParams.search);
                output({ code: successStatus, msg: {
                        count: groups.length,
                        results: groups
                    } });
            }
            catch (ex) {
                console.warn('Failed to search for AAD groups. Details: ' + ex);
                output({ code: 500, msg: ex });
            }
        }
        else {
            output({
                code: successStatus,
                msg: {
                    AuthorizedGroups: settings.decodeSettingArray(process.env.AuthorizedGroups)
                }
            });
        }
    });
}
exports.getAllowedGroups = getAllowedGroups;
function putAllowedGroups(groups, token, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var authCtx = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
            var tokenParts = token.split(' ');
            var azureToken = yield authCtx.bearerToken(() => authCtx.onBehalfOfToken(tokenParts[1], aad.ResourceARM));
            var appSettings = yield request_promise.post({
                url: `${azureWebsiteAppsettingsBaseUri}/list?${azureWebsiteAppsettingsApiVersion}`,
                json: true,
                headers: {
                    "Authorization": azureToken
                }
            });
            appSettings.properties.AuthorizedGroups = settings.encodeSettingArray(groups);
            var results = yield request_promise.put({
                url: `${azureWebsiteAppsettingsBaseUri}?${azureWebsiteAppsettingsApiVersion}`,
                json: true,
                body: appSettings,
                headers: {
                    "Authorization": azureToken
                }
            });
            process.env.AuthorizedGroups = appSettings.properties.AuthorizedGroups;
            getAllowedGroups(null, output, 201);
        }
        catch (ex) {
            console.warn('Failed to update allowed groups. Details: ' + ex);
            output({ code: 500, msg: ex });
        }
    });
}
exports.putAllowedGroups = putAllowedGroups;
//# sourceMappingURL=adminController.js.map