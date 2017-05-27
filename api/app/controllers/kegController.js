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
const tds = require("../utils/tds-promises");
const tedious_1 = require("tedious");
const untappd = require("../utils/untappd");
function getCurrentKeg_Internal(tapId) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT i.TapId, i.InstallDate, i.kegSizeInML, i.currentVolumeInML, " +
                "    k.Id as KegId, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
                "    k.BeerDescription, k.UntappdId, k.imagePath " +
                "FROM FactKegInstall i INNER JOIN DimKeg k ON i.KegId = k.Id " +
                "WHERE i.isCurrent = 1 ";
            if (tapId != null) {
                sqlStatement += "AND i.TapId = @tap_id ";
            }
            sqlStatement += "ORDER BY i.TapId";
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
            if (tapId != null) {
                if (results.length == 0) {
                    outputFunc({ code: 404, msg: 'Current Keg(s) Not Found!' });
                }
                else {
                    outputFunc({ code: 200, msg: results[0] });
                }
            }
            else {
                outputFunc({ code: 200, msg: results });
            }
        }
        catch (ex) {
            outputFunc({ code: 500, msg: ex });
        }
    });
}
exports.getCurrentKeg = getCurrentKeg;
function postPreviouslyInstalledKeg(kegId, tapId, kegSize, outputFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        new tds.TdsConnection().transaction((connection) => __awaiter(this, void 0, void 0, function* () {
            var sqlStatement = "UPDATE FactKegInstall " +
                "SET isCurrent = 0 " +
                "WHERE TapId = @tapId";
            yield connection.sql(sqlStatement)
                .parameter("tapId", tedious_1.TYPES.Int, tapId)
                .execute(false);
            sqlStatement = "INSERT INTO FactKegInstall (TapId, KegId, InstallDate, kegSizeInML, currentVolumeInML, isCurrent) " +
                "VALUES (@tapId, @kegId, @installDate, @kegSize, @kegSize, 1)";
            yield connection.sql(sqlStatement)
                .parameter("tapId", tedious_1.TYPES.Int, tapId)
                .parameter("kegId", tedious_1.TYPES.Int, kegId)
                .parameter("installDate", tedious_1.TYPES.DateTime2, new Date(Date.now()))
                .parameter("kegSize", tedious_1.TYPES.Decimal, kegSize)
                .execute(false);
            sqlStatement = "UPDATE dbo.UserVotes " +
                "SET IsCurrent = 0 " +
                "WHERE UntappdId IN ( " +
                "    SELECT k.UntappdId " +
                "    FROM dbo.DimKeg k " +
                "    WHERE Id = @kegId)";
            yield connection.sql(sqlStatement)
                .parameter("kegId", tedious_1.TYPES.Int, kegId)
                .execute(false);
        }), () => getCurrentKeg(tapId, outputFunc), (err) => outputFunc({ code: 500, msg: "Failed to post new keg: " + err }));
    });
}
exports.postPreviouslyInstalledKeg = postPreviouslyInstalledKeg;
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
            let output = results.map((row) => {
                return {
                    KegId: row.Id,
                    Name: row.Name,
                    Brewery: row.Brewery,
                    BeerType: row.BeerType,
                    ABV: row.ABV,
                    IBU: row.IBU,
                    BeerDescription: row.BeerDescription,
                    UntappdId: row.UntappdId,
                    imagePath: row.imagePath
                };
            });
            if (kegId) {
                if (output.length == 0) {
                    return outputFunc({ code: 404, msg: 'Specified keg could not be found' });
                }
                else {
                    return outputFunc({ code: 200, msg: output[0] });
                }
            }
            else {
                return outputFunc({ code: 200, msg: output });
            }
        }
        catch (ex) {
            return outputFunc({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getKeg = getKeg;
function postNewKeg(body, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (body.UntappdId && untappd.isIntegrationEnabled()) {
                try {
                    var beerInfo = yield untappd.getBeerInfo(body.UntappdId);
                    body.Name = beerInfo.beer_name;
                    body.Brewery = beerInfo.brewery_name;
                    body.BeerType = beerInfo.beer_style;
                    body.ABV = beerInfo.beer_abv;
                    body.IBU = beerInfo.beer_ibu;
                    body.BeerDescription = beerInfo.beer_description;
                    body.imagePath = beerInfo.beer_label_image;
                }
                catch (ex) {
                    if (ex.error.meta.error_type === 'invalid_param') {
                        return output({ code: 400, msg: 'Invalid Param: ' + ex.error.meta.error_detail });
                    }
                    throw ex;
                }
            }
            var sqlStatement = "INSERT INTO DimKeg " +
                "(Name, Brewery, BeerType, ABV, IBU, BeerDescription, UntappdId, imagePath) " +
                "VALUES (@name, @brewery, @beerType, @abv, @ibu, @beerDescription, @untappdId, @imagePath); " +
                "SELECT SCOPE_IDENTITY() as Id;";
            var results = yield tds.default.sql(sqlStatement)
                .parameter("name", tedious_1.TYPES.NVarChar, body.Name)
                .parameter("brewery", tedious_1.TYPES.NVarChar, body.Brewery)
                .parameter("beerType", tedious_1.TYPES.NVarChar, body.BeerType)
                .parameter("abv", tedious_1.TYPES.Decimal, body.ABV, { scale: 1 })
                .parameter("ibu", tedious_1.TYPES.Int, body.IBU)
                .parameter("beerDescription", tedious_1.TYPES.NVarChar, body.BeerDescription)
                .parameter("untappdId", tedious_1.TYPES.Int, body.UntappdId)
                .parameter("imagePath", tedious_1.TYPES.NVarChar, body.imagePath)
                .executeImmediate();
            getKeg(results[0].Id, output);
        }
        catch (ex) {
            console.error('kegController.postNewKeg error: ' + ex);
            output({ code: 500, msg: 'Internal error: ' + ex });
        }
    });
}
exports.postNewKeg = postNewKeg;
//# sourceMappingURL=kegController.js.map