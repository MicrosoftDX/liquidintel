
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import queryExpression = require('../utils/query_expression');
import request_promise = require('request-promise');
import request = require('request');
import url = require('url');
import http = require('http');
import xml2js = require('xml2js');
import {Manifest} from '../models/Manifest';

// We want a case-insensitive lookup of packagetype
// Our version of node doesn't support Object.entries(), so we have to save the temp object
var _tmp = JSON.parse(process.env.PackageUpdateUris);
var packageTypeUris = new Map<string, string>((<any>Object.keys(_tmp))
    .map((packageType: string) => [packageType.toLowerCase(), _tmp[packageType]]));
var xml2jsOptions = xml2js.defaults['0.2'];
xml2jsOptions.explicitArray = false;

function updateUrl(baseUrl: url.Url, path: string, filename?: string): url.Url {
    var urlCopy = Object.assign({}, baseUrl);
    var pathSegments = urlCopy.pathname.split('/');
    pathSegments = pathSegments.concat(path.split('/'));
    if (filename) {
        pathSegments.push(filename);
    }
    urlCopy.path = urlCopy.pathname = '/' + pathSegments
        .filter(segment => !!segment)
        .join('/');
    urlCopy.href = '';
    return urlCopy;
}

function transformXmlResponse(body): any {
    var transformedResult: any;
    // Although we don't use the async option, the result still comes through a callback
    xml2js.parseString(body, xml2jsOptions, (err, result) => {
        transformedResult = result;
    });
    return transformedResult;
}

export async function getAvailableUpdates(packageType: string, queryParams: queryExpression.QueryExpression, output: (resp:any) => express.Response) {
    try {
        packageType = packageType.toLowerCase();
        if (!packageTypeUris.has(packageType)) {
            return output({code: 404, msg: 'Package type not found.'});
        }
        // Allow the URI to be a SAS, which means query params are appended to the path
        var packageRepoUri = url.parse(packageTypeUris.get(packageType), true);
        // Enumerate the directories - each directory will contain a 'package.manifest' json file describing the release
        var packageListUri = Object.assign({}, packageRepoUri);
        packageListUri.query.restype = 'container';
        packageListUri.query.comp = 'list';
        packageListUri.query.delimiter = '/';
        packageListUri.query.include = 'metadata';
        packageListUri.search = undefined;
        let dirList = await request_promise({
            uri: url.format(packageListUri),
            transform: transformXmlResponse,
            transform2xxOnly: true
        }).promise();
        // Read the package.manifest file from each folder concurrently. The package.manifest file is JSON encoded,
        // so we can dump it out here directly.
        var manifestList = await Promise.all(dirList.EnumerationResults.Blobs.BlobPrefix
            .map(dirName => {
                return request_promise.get({
                    uri: url.format(updateUrl(packageRepoUri, dirName.Name, 'package.manifest')),
                    json: true
                })
                .then(value => {
                    return {
                        VersionNumber: value.versionNumber || 0.0,
                        Version: value.version,
                        Description: value.description,
                        IsPublished: !!value.isPublished,
                        PackageUri: url.format(updateUrl(packageRepoUri, dirName.Name, value.packageFile)),
                        Configuration: value.configuration
                    }
                })
                .catch(reason => {
                    // Swallow the 404s for any folders that don't have manifests
                    if (reason.statusCode != 404) {
                        console.warn(`Failed to get contents for package type: ${packageType}, path: ${dirName}. Details: ${reason.message}`);
                    }
                    return null;  
                });
            }));
        var includeUnpublished = queryParams.params['include-unpublished'] ? Boolean(JSON.parse(queryParams.params['include-unpublished'].value)) : false;
        var minVersionExpr = 'true';
        var minVersionParam = queryParams.params['min-version'];
        if (minVersionParam) {
            // The value is specified as a semantic version string (eg. v1.3). Convert this to a number for comparison against
            // manifest version numbers.
            var minVersionValue: string = minVersionParam.value;
            if (minVersionValue[0] == 'v') {
                minVersionValue = minVersionValue.slice(1);
            }
            // Default is GreaterThanOrEqual
            var comparitor = '>=';
            switch (minVersionParam.operator) {
                case queryExpression.Operators.GreaterThan:
                    comparitor = ">";
                    break;

                case queryExpression.Operators.LessThan:
                    comparitor = "<";
                    break;
            }
            minVersionExpr = `manifest.VersionNumber ${comparitor} ${minVersionValue}`;
        }
        var retval = manifestList
            .filter((manifest: Manifest) => manifest && 
                                            eval(minVersionExpr) &&
                                            (includeUnpublished ? true : manifest.IsPublished))
            .sort((lhs: Manifest, rhs: Manifest) => lhs.VersionNumber < rhs.VersionNumber ? -1 : lhs.VersionNumber == rhs.VersionNumber ? 0 : 1)
            .map((manifest: Manifest) => {
                var retval = {
                    Version: manifest.Version,
                    Description: manifest.Description,
                    PackageUri: manifest.PackageUri,
                    Configuration: manifest.Configuration
                };
                if (includeUnpublished) {
                    retval["IsPublished"] = manifest.IsPublished;
                }
                return retval;
            });
        output({code: 200, msg: retval});
    }
    catch (ex) {
        var message = `Failed to enumerate update repository for package type: ${packageType}. Details: ${ex}`;
        console.warn(message);
        output({code: 500, msg: message});
    }
}
