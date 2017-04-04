
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import aad = require('../utils/ad');
import settings = require('../utils/settings_encoder');
import request_promise = require('request-promise');

const azureWebsiteAppsettingsBaseUri = `https://management.azure.com/subscriptions/${process.env.WebsiteSubscription}/resourceGroups/${process.env.WebsiteResourceGroup}/providers/Microsoft.Web/sites/${process.env.WebsiteName}/slots/${process.env.WebsiteSlot}/config/appsettings`;
const azureWebsiteAppsettingsApiVersion = 'api-version=2016-08-01';
var graph = new aad.SimpleGraph(new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret));

export async function getAllowedGroups(queryParams: any, output: (resp:any) => express.Response, successStatus: number = 200) {
    if (queryParams && queryParams.search) {
        // Search for AAD groups
        try {
            var groups = await graph.searchGroups(queryParams.search);
            output({code: successStatus, msg: {
                count: groups.length,
                results: groups
            }});
        }
        catch (ex) {
            console.warn('Failed to search for AAD groups. Details: ' + ex);
            output({code: 500, msg: ex});
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
}

export async function putAllowedGroups(groups: string[], token: string, output: (resp:any) => express.Response) {
    try {
        // We need a 'on_behalf_of' token so that we can impersonate the end user as we manipulate the Azure configuration.
        var authCtx = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
        var tokenParts = token.split(' ');
        var azureToken = await authCtx.bearerToken(() => authCtx.onBehalfOfToken(tokenParts[1], aad.ResourceARM));
        var appSettings = await request_promise.post({
            url: `${azureWebsiteAppsettingsBaseUri}/list?${azureWebsiteAppsettingsApiVersion}`,
            json: true,
            headers: {
                "Authorization": azureToken
            }
        });
        appSettings.properties.AuthorizedGroups = settings.encodeSettingArray(groups);
        var results = await request_promise.put({
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
        output({code: 500, msg: ex});
    }
}

