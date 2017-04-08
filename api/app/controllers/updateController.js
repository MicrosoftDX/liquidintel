"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const queryExpression = require("../utils/query_expression");
const request_promise = require("request-promise");
const url = require("url");
const xml2js = require("xml2js");
var _tmp = JSON.parse(process.env.PackageUpdateUris);
var packageTypeUris = new Map(Object.keys(_tmp)
    .map((packageType) => [packageType.toLowerCase(), _tmp[packageType]]));
var xml2jsOptions = xml2js.defaults['0.2'];
xml2jsOptions.explicitArray = false;
function updateUrl(baseUrl, path, filename) {
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
function transformXmlResponse(body) {
    var transformedResult;
    xml2js.parseString(body, xml2jsOptions, (err, result) => {
        transformedResult = result;
    });
    return transformedResult;
}
function getAvailableUpdates(packageType, queryParams, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            packageType = packageType.toLowerCase();
            if (!packageTypeUris.has(packageType)) {
                return output({ code: 404, msg: 'Package type not found.' });
            }
            var packageRepoUri = url.parse(packageTypeUris.get(packageType), true);
            var packageListUri = Object.assign({}, packageRepoUri);
            packageListUri.query.restype = 'container';
            packageListUri.query.comp = 'list';
            packageListUri.query.delimiter = '/';
            packageListUri.query.include = 'metadata';
            packageListUri.search = undefined;
            let dirList = yield request_promise({
                uri: url.format(packageListUri),
                transform: transformXmlResponse,
                transform2xxOnly: true
            }).promise();
            var manifestList = yield Promise.all(dirList.EnumerationResults.Blobs.BlobPrefix
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
                    };
                })
                    .catch(reason => {
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
                var minVersionValue = minVersionParam.value;
                if (minVersionValue[0] == 'v') {
                    minVersionValue = minVersionValue.slice(1);
                }
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
                .filter((manifest) => manifest &&
                eval(minVersionExpr) &&
                (includeUnpublished ? true : manifest.IsPublished))
                .sort((lhs, rhs) => lhs.VersionNumber < rhs.VersionNumber ? -1 : lhs.VersionNumber == rhs.VersionNumber ? 0 : 1)
                .map((manifest) => {
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
            output({ code: 200, msg: retval });
        }
        catch (ex) {
            var message = `Failed to enumerate update repository for package type: ${packageType}. Details: ${ex}`;
            console.warn(message);
            output({ code: 500, msg: message });
        }
    });
}
exports.getAvailableUpdates = getAvailableUpdates;
//# sourceMappingURL=updateController.js.map