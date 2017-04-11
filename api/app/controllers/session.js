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
const queryExpression = require("../utils/query_expression");
const kegController = require("./kegController");
const untappd = require("../utils/untappd");
function getSessions(sessionId, queryParams, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sessions = yield getSessions_internal(sessionId, queryParams);
            if (sessionId != null) {
                if (sessions.length == 0) {
                    output({ code: 404, msg: 'Specified session not found!' });
                }
                else {
                    output({ code: 200, msg: sessions[0] });
                }
            }
            else {
                output({ code: 200, msg: sessions });
            }
        }
        catch (ex) {
            output({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getSessions = getSessions;
function getSessions_internal(sessionId, queryParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            queryParams.mapping = {
                'pourtime': { sqlName: 'PourDateTime', dataType: tedious_1.TYPES.DateTime2 },
                'pouramount': { sqlName: 'PourAmountInML', dataType: tedious_1.TYPES.Int },
                'activityid': { sqlName: 'd.Id', dataType: tedious_1.TYPES.Int }
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
            return results.map(row => {
                return {
                    SessionId: row.SessionId,
                    PourTime: row.PourDateTime,
                    PourAmount: row.PourAmountInML,
                    BeerName: row.BeerName,
                    Brewery: row.Brewery,
                    BeerType: row.BeerType,
                    ABV: row.ABV,
                    IBU: row.IBU,
                    BeerDescription: row.BeerDescription,
                    UntappdId: row.UntappdId,
                    BeerImagePath: row.imagePath,
                    PersonnelNumber: row.PersonnelNumber,
                    Alias: row.EmailName,
                    FullName: row.FullName
                };
            });
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    });
}
function postNewSession(body, output) {
    return __awaiter(this, void 0, void 0, function* () {
        var tapsInfo;
        try {
            tapsInfo = yield kegController.getCurrentKeg_Internal(null);
        }
        catch (ex) {
            return output({ code: 500, msg: "Failed to update session activity: " + ex });
        }
        new tds.TdsConnection().transaction((connection) => __awaiter(this, void 0, void 0, function* () {
            var sqlStatement = "INSERT INTO FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) " +
                "VALUES (@pourTime, @personnelNumber, @tapId, @kegId, @pourAmount); " +
                "SELECT Id, KegId, TapId, PourAmountInML FROM FactDrinkers WHERE Id = SCOPE_IDENTITY();";
            var insertDrinkers = yield connection.sql(sqlStatement)
                .parameter('pourTime', tedious_1.TYPES.DateTime2, null)
                .parameter('personnelNumber', tedious_1.TYPES.Int, null)
                .parameter('tapId', tedious_1.TYPES.Int, null)
                .parameter('kegId', tedious_1.TYPES.Int, null)
                .parameter('pourAmount', tedious_1.TYPES.Int, null)
                .prepare();
            var newActivities = yield tapsInfo
                .filter(tapInfo => body.Taps[tapInfo.TapId.toString()] != null &&
                body.Taps[tapInfo.TapId.toString()].amount > 20)
                .mapAsync((tapInfo) => __awaiter(this, void 0, void 0, function* () {
                let newActivity = yield insertDrinkers.execute(false, false, {
                    pourTime: new Date(body.sessionTime),
                    personnelNumber: body.personnelNumber,
                    tapId: tapInfo.TapId,
                    kegId: tapInfo.KegId,
                    pourAmount: parseInt(body.Taps[tapInfo.TapId.toString()].amount)
                });
                return newActivity[0];
            }));
            sqlStatement = "UPDATE FactKegInstall " +
                "SET currentVolumeInML = currentVolumeInML - @pourAmount " +
                "WHERE KegId = @kegId AND isCurrent = 1";
            var updateKegVolume = yield connection.sql(sqlStatement)
                .parameter('pourAmount', tedious_1.TYPES.Decimal, 0.0)
                .parameter('kegId', tedious_1.TYPES.Int, 0)
                .prepare();
            yield newActivities.forEachAsync((newActivity) => __awaiter(this, void 0, void 0, function* () {
                yield updateKegVolume.execute(false, false, {
                    kegId: newActivity.KegId,
                    pourAmount: newActivity.PourAmountInML
                });
            }));
            var retval = newActivities.map(activity => {
                return {
                    ActivityId: activity.Id,
                    KegId: activity.KegId,
                    TapId: activity.TapId,
                    amount: activity.PourAmountInML
                };
            });
            output({ code: 200, msg: retval });
            return retval;
        }), (results) => {
            if (untappd.isIntegrationEnabled()) {
                postUntappdActivity(results)
                    .catch(reason => {
                    console.error(reason);
                });
            }
        }, (ex) => output({ code: 500, msg: "Failed to update session activity: " + ex }));
    });
}
exports.postNewSession = postNewSession;
function postUntappdActivity(activities) {
    if (!untappd.isIntegrationEnabled()) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let sessions = yield getSessions_internal(null, new queryExpression.QueryExpression({ activityid_in: activities.map(activity => activity.ActivityId).join(',') }));
            untappd.postSessionCheckin(sessions);
        }
        catch (ex) {
            reject(ex);
        }
    }));
}
//# sourceMappingURL=session.js.map