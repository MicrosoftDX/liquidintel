
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import queryExpression = require('../utils/query_expression');
import kegController = require('./kegController');
import untappd = require('../utils/untappd');
import {Session} from '../models/Session';

export async function getSessions(sessionId: number, queryParams: queryExpression.QueryExpression, output: (resp:any) => express.Response) {
    try {
        let sessions = await getSessions_internal(sessionId, queryParams);
        if (sessionId != null && sessions.length == 0) {
            return output({code: 404, msg:'Specified session not found!'});
        }
        else {
            return output({ code: 200, msg: sessions});
        }
    }
    catch (ex) {
        return output({code: 500, msg:'Internal Error: ' + ex});
    }
}

async function getSessions_internal(sessionId: number, queryParams: queryExpression.QueryExpression): Promise<Session[]> {
    try {
        queryParams.mapping = {
            'pourtime': {sqlName:'PourDateTime', dataType: TYPES.DateTime2},
            'pouramount': {sqlName:'PourAmountInML', dataType: TYPES.Int},
            'activityid': {sqlName:'d.Id', dataType: TYPES.Int}
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
                sqlStatement += "d.Id = @sessionId"
            }
            else {
                sqlStatement += queryParams.getSqlFilterPredicates();
            }
        }
        if (queryParams.isAnyOrdering()) {
            sqlStatement += queryParams.getSqlOrderByClauses()
        }
        else {
            sqlStatement += " ORDER BY d.PourDateTime DESC";
        }
        var stmt = tds.default.sql(sqlStatement);
        if (sessionId != null) {
            stmt.parameter('sessionId', TYPES.Int, sessionId);
        }
        if (queryParams.isAnyFilter()) {
            queryParams.addRequestParameters(stmt);
        }
        let results = await stmt.executeImmediate();
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
            }});
    }
    catch (ex) {
        return Promise.reject(ex);
    }
}

export async function postNewSession(body: any, output: (resp:any) => express.Response) {
    new tds.TdsConnection().transaction(async (connection: tds.TdsConnection) => {
        // Lookup our current keg info
        let tapsInfo = await kegController.getCurrentKeg_Internal(null);
        // Add journal entries into the activities table
        var sqlStatement = "INSERT INTO FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) " + 
                            "VALUES (@pourTime, @personnelNumber, @tapId, @kegId, @pourAmount); " +
                            "SELECT Id, KegId, PourAmountInML FROM FactDrinkers WHERE Id = SCOPE_IDENTITY();";
        var insertDrinkers = await connection.sql(sqlStatement)
            .parameter('pourTime', TYPES.DateTime2, null)
            .parameter('personnelNumber', TYPES.Int, null)
            .parameter('tapId', TYPES.Int, null)
            .parameter('kegId', TYPES.Int, null)
            .parameter('pourAmount', TYPES.Int, null)
            .prepare();
        var newActivities = await Promise.all(tapsInfo
            .filter(tapInfo => body.Taps[tapInfo.TapId.toString()] != null &&
                                body.Taps[tapInfo.TapId.toString()].amount > 0)
            .map(async tapInfo => {
                // Important we await here as we can't have multiple statements activity at once
                return await insertDrinkers.execute(false, {
                    pourTime: new Date(body.sessionTime), 
                    personnelNumber: body.personnelNumber,
                    tapId: tapInfo.TapId,
                    kegId: tapInfo.KegId,
                    pourAmount: Number(body.Taps[tapInfo.TapId.toString()].amount)
                })[0];
            }));

        // Now decrement the available volume in each of our kegs
        sqlStatement = "UPDATE FactKegInstall " + 
                        "SET currentVolumeInML = currentVolumeInML - @pourAmount " + 
                        "WHERE KegId = @kegId AND isCurrent = 1";
        var updateKegVolume = await connection.sql(sqlStatement)
            .parameter('pourAmount', TYPES.Decimal, 0.0)
            .parameter('kegId', TYPES.Int, 0)
            .prepare();
        newActivities.forEach(async newActivity => {
            await updateKegVolume.execute(false, {
                kegId: newActivity.KegId,
                pourAmount: newActivity.PourAmountInML
            });
        });
        var retval = newActivities.map(activity => { return {ActivityId: activity.Id, KegId: activity.KegId}; });
        // Asynchronously post checkin to UntappdId
        if (untappd.isIntegrationEnabled()) {
            postUntappdActivity(retval);
        }
        output({code: 200, msg: retval});
    }, 
    null, 
    (ex: Error) => output({code:500, msg: "Failed to update session activity: " + ex}));
}

function postUntappdActivity(activities: any[]): Promise<void> {
    if (!untappd.isIntegrationEnabled()) {
        return Promise.resolve();
    }
    return new Promise<void>(async (resolve, reject) => {
        try {
            let sessions = await getSessions_internal(null, new queryExpression.QueryExpression({activity_id: activities.map(activity => activity.ActivityId).join(',')}));
            untappd.postSessionCheckin(sessions);
        }
        catch (ex) {
            reject(ex);
        }
    });
}