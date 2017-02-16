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
const kegController = require("./kegController");
function getSessions(sessionId, queryParams, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            queryParams.mapping = {
                'pourtime': { sqlName: 'PourDateTime', dataType: tedious_1.TYPES.DateTime2 },
                'pouramount': { sqlName: 'PourAmountInML', dataType: tedious_1.TYPES.Int }
            };
            queryParams.ordering = [
                'pourtime',
                'pouramount'
            ];
            queryParams.limit = 'count';
            var sqlStatement = `SELECT ${queryParams.getSqlLimitClause()} d.Id as SessionId, k.Name as BeerName, * ` +
                `FROM FactDrinkers d INNER JOIN DimKeg k ON d.KegId = k.Id ` +
                `    INNER JOIN HC01Person p ON d.PersonnelNumber = p.PersonnelNumber `;
            if (sessionId != null || queryParams.isAnyFilter()) {
                sqlStatement += "WHERE ";
                if (sessionId != null) {
                    sqlStatement += "d.Id = @sessionId";
                }
                else {
                    sqlStatement += queryParams.getSqlFilterPredicates();
                }
            }
            if (queryParams.isAnyOrdering()) {
                sqlStatement += queryParams.getSqlOrderByClauses();
            }
            else {
                sqlStatement += " ORDER BY d.PourDateTime DESC";
            }
            var stmt = tds.default.sql(sqlStatement);
            if (sessionId != null) {
                stmt.parameter('sessionId', tedious_1.TYPES.Int, sessionId);
            }
            if (queryParams.isAnyFilter()) {
                queryParams.addRequestParameters(stmt);
            }
            let results = yield stmt.executeImmediate();
            if (sessionId != null && results.length == 0) {
                return output({ code: 404, msg: 'Specified session not found!' });
            }
            else {
                return output({ code: 200, msg: results.map(row => {
                        return {
                            'SessionId': row.SessionId,
                            'PourTime': row.PourDateTime,
                            'PourAmount': row.PourAmountInML,
                            'BeerName': row.BeerName,
                            'Brewery': row.Brewery,
                            'BeerType': row.BeerType,
                            'ABV': row.ABV,
                            'IBU': row.IBU,
                            'BeerDescription': row.BeerDescription,
                            'UntappdId': row.UntappdId,
                            'BeerImagePath': row.imagePath,
                            'PersonnelNumber': row.PersonnelNumber,
                            'Alias': row.EmailName,
                            'FullName': row.FullName
                        };
                    }) });
            }
        }
        catch (ex) {
            return output({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getSessions = getSessions;
function postNewSession(body, output) {
    return __awaiter(this, void 0, void 0, function* () {
        var inXact = false;
        var connection;
        try {
            let tapsInfo = yield kegController.getCurrentKeg_Internal(null);
            let connection = new tds.TdsConnection();
            yield connection.beginTransaction();
            inXact = true;
            var sqlStatement = "INSERT INTO FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) " +
                "VALUES (@pourTime, @personnelNumber, @tapId, @kegId, @pourAmount); " +
                "SELECT Id, KegId, PourAmountInML FROM FactDrinkers WHERE Id = SCOPE_IDENTITY();";
            var insertDrinkers = yield connection.sql(sqlStatement)
                .parameter('pourTime', tedious_1.TYPES.DateTime2, null)
                .parameter('personnelNumber', tedious_1.TYPES.Int, null)
                .parameter('tapId', tedious_1.TYPES.Int, null)
                .parameter('kegId', tedious_1.TYPES.Int, null)
                .parameter('pourAmount', tedious_1.TYPES.Int, null)
                .prepare();
            var newActivities = yield Promise.all(tapsInfo
                .filter(tapInfo => body.Taps[tapInfo.TapId.toString()] != null &&
                body.Taps[tapInfo.TapId.toString()].amount > 0)
                .map((tapInfo) => __awaiter(this, void 0, void 0, function* () {
                return yield insertDrinkers.execute(false, {
                    pourTime: new Date(body.sessionTime),
                    personnelNumber: body.personnelNumber,
                    tapId: tapInfo.TapId,
                    kegId: tapInfo.KegId,
                    pourAmount: Number(body.Taps[tapInfo.TapId.toString()].amount)
                })[0];
            })));
            sqlStatement = "UPDATE FactKegInstall " +
                "SET currentVolumeInML = currentVolumeInML - @pourAmount " +
                "WHERE KegId = @kegId";
            var updateKegVolume = yield connection.sql(sqlStatement)
                .parameter('pourAmount', tedious_1.TYPES.Decimal, 0.0)
                .parameter('kegId', tedious_1.TYPES.Int, 0)
                .prepare();
            newActivities.forEach((newActivity) => __awaiter(this, void 0, void 0, function* () {
                yield updateKegVolume.execute(false, {
                    kegId: newActivity.KegId,
                    pourAmount: newActivity.PourAmountInML
                });
            }));
            yield connection.commitTransaction();
            output({ code: 200, msg: newActivities.map(activity => { return { ActivityId: activity.Id, KegId: activity.KegId }; }) });
        }
        catch (ex) {
            if (connection && inXact) {
                yield connection.rollbackTransaction();
            }
            output({ code: 500, msg: "Failed to update session activity: " + ex });
        }
        finally {
            if (connection) {
                connection.close();
            }
        }
    });
}
exports.postNewSession = postNewSession;
//# sourceMappingURL=session.js.map