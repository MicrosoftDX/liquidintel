
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import queryExpression = require('../utils/query_expression');
import request_promise = require('request-promise');
import request = require('request');
import url = require('url');
import http = require('http');
import xml2js = require('xml2js');

// We want a case-insensitive lookup of packagetype
// Our version of node doesn't support Object.entries(), so we have to save the temp object
var _tmp = JSON.parse(process.env.PackageUpdateUris);
var packageTypeUris = new Map<string, string>((<any>Object.keys(_tmp))
    .map((packageType: string) => [packageType.toLowerCase(), _tmp[packageType]]));
var xml2jsOptions = xml2js.defaults['0.2'];
xml2jsOptions.explicitArray = false;

export async function getAvailableUpdates(packageType: string, queryParams: queryExpression.QueryExpression, output: (resp:any) => express.Response) {
    try {
        packageType = packageType.toLowerCase();
        if (!packageTypeUris.has(packageType)) {
            return output({code:400, msg:'Package update feature has not be enabled on this server.'});
        }
        // Allow the URI to be a SAS, which means query params are appended to the path
        var packageRepoUri = url.parse(packageTypeUris.get(packageType), true);
        // Enumerate the directories - each directory will contain a 'package.manifest' json file describing the release
        packageRepoUri.query.restype = 'container';
        packageRepoUri.query.comp = 'list';
        packageRepoUri.query.delimiter = '/';
        packageRepoUri.query.include = 'metadata';
        packageRepoUri.search = undefined;
        let dirList = await request_promise({
            uri: url.format(packageRepoUri),
            transform: (body: any, response: http.IncomingMessage) => {
                var transformedResult: any;
                // Although we don't use the async option, the result still comes through a callback
                xml2js.parseString(body, xml2jsOptions, (err, result) => {
                    transformedResult = result;
                });
                return transformedResult;
            },
            transform2xxOnly: true
        }).promise();
        console.log(dirList.EnumerationResults.Blobs);
    }
    catch (ex) {
        var message = `Failed to enumerate update repository for package type: ${packageType}. Details: ${ex}`;
        console.warn(message);
        output({code:500, msg:message});
    }
}
