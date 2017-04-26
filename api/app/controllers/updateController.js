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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9jb250cm9sbGVycy91cGRhdGVDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFJQSw2REFBOEQ7QUFDOUQsbURBQW9EO0FBRXBELDJCQUE0QjtBQUU1QixpQ0FBa0M7QUFLbEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDckQsSUFBSSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQXVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFO0tBQ2pFLEdBQUcsQ0FBQyxDQUFDLFdBQW1CLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25GLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsYUFBYSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFcEMsbUJBQW1CLE9BQWdCLEVBQUUsSUFBWSxFQUFFLFFBQWlCO0lBQ2hFLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1gsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxZQUFZO1NBQy9DLE1BQU0sQ0FB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LElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDTCxDQUFDO0NBQUE7QUE3RkQsa0RBNkZDIiwiZmlsZSI6ImFwcC9jb250cm9sbGVycy91cGRhdGVDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xyXG5pbXBvcnQgdGRzID0gcmVxdWlyZSgnLi4vdXRpbHMvdGRzLXByb21pc2VzJyk7XHJcbmltcG9ydCB7VFlQRVN9IGZyb20gJ3RlZGlvdXMnO1xyXG5pbXBvcnQgcXVlcnlFeHByZXNzaW9uID0gcmVxdWlyZSgnLi4vdXRpbHMvcXVlcnlfZXhwcmVzc2lvbicpO1xyXG5pbXBvcnQgcmVxdWVzdF9wcm9taXNlID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XHJcbmltcG9ydCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xyXG5pbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJyk7XHJcbmltcG9ydCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xyXG5pbXBvcnQgeG1sMmpzID0gcmVxdWlyZSgneG1sMmpzJyk7XHJcbmltcG9ydCB7TWFuaWZlc3R9IGZyb20gJy4uL21vZGVscy9NYW5pZmVzdCc7XHJcblxyXG4vLyBXZSB3YW50IGEgY2FzZS1pbnNlbnNpdGl2ZSBsb29rdXAgb2YgcGFja2FnZXR5cGVcclxuLy8gT3VyIHZlcnNpb24gb2Ygbm9kZSBkb2Vzbid0IHN1cHBvcnQgT2JqZWN0LmVudHJpZXMoKSwgc28gd2UgaGF2ZSB0byBzYXZlIHRoZSB0ZW1wIG9iamVjdFxyXG52YXIgX3RtcCA9IEpTT04ucGFyc2UocHJvY2Vzcy5lbnYuUGFja2FnZVVwZGF0ZVVyaXMpO1xyXG52YXIgcGFja2FnZVR5cGVVcmlzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKDxhbnk+T2JqZWN0LmtleXMoX3RtcCkpXHJcbiAgICAubWFwKChwYWNrYWdlVHlwZTogc3RyaW5nKSA9PiBbcGFja2FnZVR5cGUudG9Mb3dlckNhc2UoKSwgX3RtcFtwYWNrYWdlVHlwZV1dKSk7XHJcbnZhciB4bWwyanNPcHRpb25zID0geG1sMmpzLmRlZmF1bHRzWycwLjInXTtcclxueG1sMmpzT3B0aW9ucy5leHBsaWNpdEFycmF5ID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVVcmwoYmFzZVVybDogdXJsLlVybCwgcGF0aDogc3RyaW5nLCBmaWxlbmFtZT86IHN0cmluZyk6IHVybC5Vcmwge1xyXG4gICAgdmFyIHVybENvcHkgPSBPYmplY3QuYXNzaWduKHt9LCBiYXNlVXJsKTtcclxuICAgIHZhciBwYXRoU2VnbWVudHMgPSB1cmxDb3B5LnBhdGhuYW1lLnNwbGl0KCcvJyk7XHJcbiAgICBwYXRoU2VnbWVudHMgPSBwYXRoU2VnbWVudHMuY29uY2F0KHBhdGguc3BsaXQoJy8nKSk7XHJcbiAgICBpZiAoZmlsZW5hbWUpIHtcclxuICAgICAgICBwYXRoU2VnbWVudHMucHVzaChmaWxlbmFtZSk7XHJcbiAgICB9XHJcbiAgICB1cmxDb3B5LnBhdGggPSB1cmxDb3B5LnBhdGhuYW1lID0gJy8nICsgcGF0aFNlZ21lbnRzXHJcbiAgICAgICAgLmZpbHRlcihzZWdtZW50ID0+ICEhc2VnbWVudClcclxuICAgICAgICAuam9pbignLycpO1xyXG4gICAgdXJsQ29weS5ocmVmID0gJyc7XHJcbiAgICByZXR1cm4gdXJsQ29weTtcclxufVxyXG5cclxuZnVuY3Rpb24gdHJhbnNmb3JtWG1sUmVzcG9uc2UoYm9keSk6IGFueSB7XHJcbiAgICB2YXIgdHJhbnNmb3JtZWRSZXN1bHQ6IGFueTtcclxuICAgIC8vIEFsdGhvdWdoIHdlIGRvbid0IHVzZSB0aGUgYXN5bmMgb3B0aW9uLCB0aGUgcmVzdWx0IHN0aWxsIGNvbWVzIHRocm91Z2ggYSBjYWxsYmFja1xyXG4gICAgeG1sMmpzLnBhcnNlU3RyaW5nKGJvZHksIHhtbDJqc09wdGlvbnMsIChlcnIsIHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIHRyYW5zZm9ybWVkUmVzdWx0ID0gcmVzdWx0O1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdHJhbnNmb3JtZWRSZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdmFpbGFibGVVcGRhdGVzKHBhY2thZ2VUeXBlOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBxdWVyeUV4cHJlc3Npb24uUXVlcnlFeHByZXNzaW9uLCBvdXRwdXQ6IChyZXNwOmFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBwYWNrYWdlVHlwZSA9IHBhY2thZ2VUeXBlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKCFwYWNrYWdlVHlwZVVyaXMuaGFzKHBhY2thZ2VUeXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOiA0MDQsIG1zZzogJ1BhY2thZ2UgdHlwZSBub3QgZm91bmQuJ30pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBbGxvdyB0aGUgVVJJIHRvIGJlIGEgU0FTLCB3aGljaCBtZWFucyBxdWVyeSBwYXJhbXMgYXJlIGFwcGVuZGVkIHRvIHRoZSBwYXRoXHJcbiAgICAgICAgdmFyIHBhY2thZ2VSZXBvVXJpID0gdXJsLnBhcnNlKHBhY2thZ2VUeXBlVXJpcy5nZXQocGFja2FnZVR5cGUpLCB0cnVlKTtcclxuICAgICAgICAvLyBFbnVtZXJhdGUgdGhlIGRpcmVjdG9yaWVzIC0gZWFjaCBkaXJlY3Rvcnkgd2lsbCBjb250YWluIGEgJ3BhY2thZ2UubWFuaWZlc3QnIGpzb24gZmlsZSBkZXNjcmliaW5nIHRoZSByZWxlYXNlXHJcbiAgICAgICAgdmFyIHBhY2thZ2VMaXN0VXJpID0gT2JqZWN0LmFzc2lnbih7fSwgcGFja2FnZVJlcG9VcmkpO1xyXG4gICAgICAgIHBhY2thZ2VMaXN0VXJpLnF1ZXJ5LnJlc3R5cGUgPSAnY29udGFpbmVyJztcclxuICAgICAgICBwYWNrYWdlTGlzdFVyaS5xdWVyeS5jb21wID0gJ2xpc3QnO1xyXG4gICAgICAgIHBhY2thZ2VMaXN0VXJpLnF1ZXJ5LmRlbGltaXRlciA9ICcvJztcclxuICAgICAgICBwYWNrYWdlTGlzdFVyaS5xdWVyeS5pbmNsdWRlID0gJ21ldGFkYXRhJztcclxuICAgICAgICBwYWNrYWdlTGlzdFVyaS5zZWFyY2ggPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgbGV0IGRpckxpc3QgPSBhd2FpdCByZXF1ZXN0X3Byb21pc2Uoe1xyXG4gICAgICAgICAgICB1cmk6IHVybC5mb3JtYXQocGFja2FnZUxpc3RVcmkpLFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVhtbFJlc3BvbnNlLFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm0yeHhPbmx5OiB0cnVlXHJcbiAgICAgICAgfSkucHJvbWlzZSgpO1xyXG4gICAgICAgIC8vIFJlYWQgdGhlIHBhY2thZ2UubWFuaWZlc3QgZmlsZSBmcm9tIGVhY2ggZm9sZGVyIGNvbmN1cnJlbnRseS4gVGhlIHBhY2thZ2UubWFuaWZlc3QgZmlsZSBpcyBKU09OIGVuY29kZWQsXHJcbiAgICAgICAgLy8gc28gd2UgY2FuIGR1bXAgaXQgb3V0IGhlcmUgZGlyZWN0bHkuXHJcbiAgICAgICAgdmFyIG1hbmlmZXN0TGlzdCA9IGF3YWl0IFByb21pc2UuYWxsKGRpckxpc3QuRW51bWVyYXRpb25SZXN1bHRzLkJsb2JzLkJsb2JQcmVmaXhcclxuICAgICAgICAgICAgLm1hcChkaXJOYW1lID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0X3Byb21pc2UuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmk6IHVybC5mb3JtYXQodXBkYXRlVXJsKHBhY2thZ2VSZXBvVXJpLCBkaXJOYW1lLk5hbWUsICdwYWNrYWdlLm1hbmlmZXN0JykpLFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWVcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVmVyc2lvbk51bWJlcjogdmFsdWUudmVyc2lvbk51bWJlciB8fCAwLjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFZlcnNpb246IHZhbHVlLnZlcnNpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgSXNQdWJsaXNoZWQ6ICEhdmFsdWUuaXNQdWJsaXNoZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBhY2thZ2VVcmk6IHVybC5mb3JtYXQodXBkYXRlVXJsKHBhY2thZ2VSZXBvVXJpLCBkaXJOYW1lLk5hbWUsIHZhbHVlLnBhY2thZ2VGaWxlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb246IHZhbHVlLmNvbmZpZ3VyYXRpb25cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKHJlYXNvbiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU3dhbGxvdyB0aGUgNDA0cyBmb3IgYW55IGZvbGRlcnMgdGhhdCBkb24ndCBoYXZlIG1hbmlmZXN0c1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24uc3RhdHVzQ29kZSAhPSA0MDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gZ2V0IGNvbnRlbnRzIGZvciBwYWNrYWdlIHR5cGU6ICR7cGFja2FnZVR5cGV9LCBwYXRoOiAke2Rpck5hbWV9LiBEZXRhaWxzOiAke3JlYXNvbi5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDsgIFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB2YXIgaW5jbHVkZVVucHVibGlzaGVkID0gcXVlcnlQYXJhbXMucGFyYW1zWydpbmNsdWRlLXVucHVibGlzaGVkJ10gPyBCb29sZWFuKEpTT04ucGFyc2UocXVlcnlQYXJhbXMucGFyYW1zWydpbmNsdWRlLXVucHVibGlzaGVkJ10udmFsdWUpKSA6IGZhbHNlO1xyXG4gICAgICAgIHZhciBtaW5WZXJzaW9uRXhwciA9ICd0cnVlJztcclxuICAgICAgICB2YXIgbWluVmVyc2lvblBhcmFtID0gcXVlcnlQYXJhbXMucGFyYW1zWydtaW4tdmVyc2lvbiddO1xyXG4gICAgICAgIGlmIChtaW5WZXJzaW9uUGFyYW0pIHtcclxuICAgICAgICAgICAgLy8gVGhlIHZhbHVlIGlzIHNwZWNpZmllZCBhcyBhIHNlbWFudGljIHZlcnNpb24gc3RyaW5nIChlZy4gdjEuMykuIENvbnZlcnQgdGhpcyB0byBhIG51bWJlciBmb3IgY29tcGFyaXNvbiBhZ2FpbnN0XHJcbiAgICAgICAgICAgIC8vIG1hbmlmZXN0IHZlcnNpb24gbnVtYmVycy5cclxuICAgICAgICAgICAgdmFyIG1pblZlcnNpb25WYWx1ZTogc3RyaW5nID0gbWluVmVyc2lvblBhcmFtLnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobWluVmVyc2lvblZhbHVlWzBdID09ICd2Jykge1xyXG4gICAgICAgICAgICAgICAgbWluVmVyc2lvblZhbHVlID0gbWluVmVyc2lvblZhbHVlLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIERlZmF1bHQgaXMgR3JlYXRlclRoYW5PckVxdWFsXHJcbiAgICAgICAgICAgIHZhciBjb21wYXJpdG9yID0gJz49JztcclxuICAgICAgICAgICAgc3dpdGNoIChtaW5WZXJzaW9uUGFyYW0ub3BlcmF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgcXVlcnlFeHByZXNzaW9uLk9wZXJhdG9ycy5HcmVhdGVyVGhhbjpcclxuICAgICAgICAgICAgICAgICAgICBjb21wYXJpdG9yID0gXCI+XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBxdWVyeUV4cHJlc3Npb24uT3BlcmF0b3JzLkxlc3NUaGFuOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhcml0b3IgPSBcIjxcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtaW5WZXJzaW9uRXhwciA9IGBtYW5pZmVzdC5WZXJzaW9uTnVtYmVyICR7Y29tcGFyaXRvcn0gJHttaW5WZXJzaW9uVmFsdWV9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJldHZhbCA9IG1hbmlmZXN0TGlzdFxyXG4gICAgICAgICAgICAuZmlsdGVyKChtYW5pZmVzdDogTWFuaWZlc3QpID0+IG1hbmlmZXN0ICYmIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2YWwobWluVmVyc2lvbkV4cHIpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGluY2x1ZGVVbnB1Ymxpc2hlZCA/IHRydWUgOiBtYW5pZmVzdC5Jc1B1Ymxpc2hlZCkpXHJcbiAgICAgICAgICAgIC5zb3J0KChsaHM6IE1hbmlmZXN0LCByaHM6IE1hbmlmZXN0KSA9PiBsaHMuVmVyc2lvbk51bWJlciA8IHJocy5WZXJzaW9uTnVtYmVyID8gLTEgOiBsaHMuVmVyc2lvbk51bWJlciA9PSByaHMuVmVyc2lvbk51bWJlciA/IDAgOiAxKVxyXG4gICAgICAgICAgICAubWFwKChtYW5pZmVzdDogTWFuaWZlc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXR2YWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgVmVyc2lvbjogbWFuaWZlc3QuVmVyc2lvbixcclxuICAgICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjogbWFuaWZlc3QuRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgUGFja2FnZVVyaTogbWFuaWZlc3QuUGFja2FnZVVyaSxcclxuICAgICAgICAgICAgICAgICAgICBDb25maWd1cmF0aW9uOiBtYW5pZmVzdC5Db25maWd1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVVbnB1Ymxpc2hlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHZhbFtcIklzUHVibGlzaGVkXCJdID0gbWFuaWZlc3QuSXNQdWJsaXNoZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dmFsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICBvdXRwdXQoe2NvZGU6IDIwMCwgbXNnOiByZXR2YWx9KTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gYEZhaWxlZCB0byBlbnVtZXJhdGUgdXBkYXRlIHJlcG9zaXRvcnkgZm9yIHBhY2thZ2UgdHlwZTogJHtwYWNrYWdlVHlwZX0uIERldGFpbHM6ICR7ZXh9YDtcclxuICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgb3V0cHV0KHtjb2RlOiA1MDAsIG1zZzogbWVzc2FnZX0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==
