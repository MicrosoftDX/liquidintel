"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const tds = require("../utils/tds-promises");
const tedious_1 = require("tedious");
function getCurrentKeg_Internal(tapId) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT i.TapId, i.InstallDate, i.kegSizeInML, i.currentVolumeInML, " +
                "    k.Id as KegId, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
                "    k.BeerDescription, k.UntappdId, k.imagePath " +
                "FROM FactKegInstall i INNER JOIN DimKeg k ON i.KegId = k.Id " +
                "WHERE i.isCurrent = 1 ";
            if (tapId != null) {
                sqlStatement += "AND i.TapId = @tap_id";
            }
            var stmt = tds.default.sql(sqlStatement);
            if (tapId != null) {
                stmt.parameter('tap_id', tedious_1.TYPES.Int, tapId);
            }
            let results = yield stmt.executeImmediate();
            resolve(results.map(row => {
                return {
                    'TapId': row.TapId,
                    'KegId': row.KegId,
                    'InstallDate': row.InstallDate,
                    'KegSize': row.kegSizeInML,
                    'CurrentVolume': row.currentVolumeInML,
                    'Name': row.Name,
                    'Brewery': row.Brewery,
                    'BeerType': row.BeerType,
                    'ABV': row.ABV,
                    'IBU': row.IBU,
                    'BeerDescription': row.BeerDescription,
                    'UntappdId': row.UntappdId,
                    'imagePath': row.imagePath
                };
            }));
        }
        catch (ex) {
            reject(ex);
        }
    }));
}
exports.getCurrentKeg_Internal = getCurrentKeg_Internal;
function getCurrentKeg(tapId, outputFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let results = yield getCurrentKeg_Internal(tapId);
            if (tapId != null && results.length == 0) {
                outputFunc({ code: 404, msg: 'Current Keg(s) Not Found!' });
            }
            outputFunc({ code: 200, msg: results });
        }
        catch (ex) {
            outputFunc({ code: 500, msg: ex });
        }
    });
}
exports.getCurrentKeg = getCurrentKeg;
function getKeg(kegId, outputFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT k.Id, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
                "    k.BeerDescription, k.UntappdId, k.imagePath " +
                "FROM DimKeg k ";
            if (kegId != null) {
                sqlStatement += "WHERE Id = @keg_id";
            }
            var stmt = tds.default.sql(sqlStatement);
            if (kegId != null) {
                stmt.parameter('keg_id', tedious_1.TYPES.Int, kegId);
            }
            let results = yield stmt.executeImmediate();
            return outputFunc({ code: 200, msg: results.map(row => {
                    return {
                        'KegId': row.Id,
                        'Name': row.Name,
                        'Brewery': row.Brewery,
                        'BeerType': row.BeerType,
                        'ABV': row.ABV,
                        'IBU': row.IBU,
                        'BeerDescription': row.BeerDescription,
                        'UntappdId': row.UntappdId,
                        'imagePath': row.imagePath
                    };
                }) });
        }
        catch (ex) {
            return outputFunc({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getKeg = getKeg;
function postNewKeg() {
}
exports.postNewKeg = postNewKeg;
function postPreviouslyInstalledKeg(kegId, tapId, volumeInGallons, outputFunc) {
}
exports.postPreviouslyInstalledKeg = postPreviouslyInstalledKeg;
function putKegFinished(tapId, outputFunc) {
    var markKegAsFinished = "UPDATE dbo.FactKegInstall SET isCurrent=0 WHERE tapId=@tap_id and isCurrent=1";
}
exports.putKegFinished = putKegFinished;
//# sourceMappingURL=kegController.js.map