"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request_promise = require("request-promise");
const url = require("url");
const xml2js = require("xml2js");
var _tmp = JSON.parse(process.env.PackageUpdateUris);
var packageTypeUris = new Map(Object.keys(_tmp)
    .map((packageType) => [packageType.toLowerCase(), _tmp[packageType]]));
var xml2jsOptions = xml2js.defaults['0.2'];
xml2jsOptions.explicitArray = false;
function getAvailableUpdates(packageType, queryParams, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            packageType = packageType.toLowerCase();
            if (!packageTypeUris.has(packageType)) {
                return output({ code: 400, msg: 'Package update feature has not be enabled on this server.' });
            }
            var packageRepoUri = url.parse(packageTypeUris.get(packageType), true);
            packageRepoUri.query.restype = 'container';
            packageRepoUri.query.comp = 'list';
            packageRepoUri.query.delimiter = '/';
            packageRepoUri.query.include = 'metadata';
            packageRepoUri.search = undefined;
            let dirList = yield request_promise({
                uri: url.format(packageRepoUri),
                transform: (body, response) => {
                    var transformedResult;
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
            output({ code: 500, msg: message });
        }
    });
}
exports.getAvailableUpdates = getAvailableUpdates;
//# sourceMappingURL=updateController.js.map