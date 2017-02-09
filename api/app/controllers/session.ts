
import express = require('express');
import tedious = require('tedious');
import queryExpression = require('../utils/query_expression');
import kegController = require('./kegController');

export function getSessions(sessionId: number, queryParams: queryExpression.QueryExpression, connection: tedious.Connection, output: (resp:any) => express.Response) {
    var sqlStatement = "SELECT d.Id as SessionId, k.Name as BeerName, * " + 
                       "FROM FactDrinkers d INNER JOIN DimKeg k ON d.KegId = k.Id " +
                       "    INNER JOIN HC01Person p ON d.PersonnelNumber = p.PersonnelNumber ";
    queryParams.mapping = {
        'PourTime':{sqlName:'PourDateTime', dataType: tedious.TYPES.DateTime2},
        'PourAmount':{sqlName:'PourAmountInML', dataType: tedious.TYPES.Int}
    };
    if (sessionId != null || queryParams.isAny()) {
        sqlStatement += "WHERE ";
        if (sessionId != null) {
            sqlStatement += "d.Id = @sessionId"
        }
        else {
            sqlStatement += queryParams.getSqlFilterPredicates();
        }
    }
    sqlStatement += " ORDER BY d.PourDateTime DESC";
    var request = new tedious.Request(sqlStatement, (err, rowCount, rows) => {
        if (err) {
            return output({code: 500, msg:'Internal Error: ' + err});
        }
        else if (rowCount == 0 && sessionId != null) {
            return output({code: 404, msg:'Specified session not found!'});
        }
        else {
            return output({ code: 200, msg: rows.map(row => {
                    return {
                        'SessionId': row.SessionId.value,
                        'PourTime': row.PourDateTime.value,
                        'PourAmount': row.PourAmountInML.value,
                        'BeerName': row.BeerName.value,
                        'Brewery': row.Brewery.value,
                        'BeerType': row.BeerType.value,
                        'ABV': row.ABV.value,
                        'IBU': row.IBU.value,
                        'BeerDescription': row.BeerDescription.value,
                        'UntappdId': row.UntappdId.value,
                        'BeerImagePath': row.imagePath.value,
                        'PersonnelNumber': row.PersonnelNumber.value,
                        'Alias': row.EmailName.value,
                        'FullName': row.FullName.value
                    };
                })});
        }
    });
    if (sessionId != null) {
        request.addParameter('sessionId', tedious.TYPES.Int, sessionId);
    }
    else if (queryParams.isAny()) {
        queryParams.addRequestParameters(request);
    }
    connection.execSql(request);
}

export function postNewSession(body: any, connection: tedious.Connection, output: (resp:any) => express.Response) {
    // Lookup our current keg info
    kegController.getCurrentKeg_Internal(null, connection, (tapsResp) => {
        if (tapsResp.code != 200) {
            return output(tapsResp);
        }
        connection.transaction((error, done) => {
            if (error) {
                return output({code:500, msg: "Failed to update session activity: " + error});
            }
            // Add journal entries into the activities table
            var requests: [tedious.Request, boolean, any][] = [];
            var nextRequest = () => {
                var requestInfo = requests.shift();
                if (requestInfo[1]) {
                    connection.prepare(requestInfo[0]);
                    requestInfo[0].on('prepared', () => {
                        connection.execute(requestInfo[0], requestInfo[2]);
                    });
                }
                else {
                    connection.execute(requestInfo[0], requestInfo[2]);
                }
            };
            var newActivities: [number, number][] = [];
            var sqlStatement = "INSERT INTO FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) " + 
                               "VALUES (@pourTime, @personnelNumber, @tapId, @kegId, @pourAmount); " +
                               "SELECT Id, KegId FROM FactDrinkers WHERE Id = SCOPE_IDENTITY();";
            var insertDrinkers = new tedious.Request(sqlStatement, (error, rowCount, rows) => {
                if (error) {
                    return done(error, () => {
                        return output({code:500, msg: "Failed to update session activity: " + error});
                    });
                }
                if (rowCount > 0) {
                    newActivities.push([rows[0].Id.value, rows[0].KegId.value]);
                }
                nextRequest();
            });
            insertDrinkers.addParameter('pourTime', tedious.TYPES.DateTime2, null);
            insertDrinkers.addParameter('personnelNumber', tedious.TYPES.Int, null);
            insertDrinkers.addParameter('tapId', tedious.TYPES.Int, null);
            insertDrinkers.addParameter('kegId', tedious.TYPES.Int, null);
            insertDrinkers.addParameter('pourAmount', tedious.TYPES.Int, null);
            var prepareRequest = true;
            requests = tapsResp.msg
                .filter(tapInfo => body.Taps[tapInfo.TapId.toString()] != null)
                .map(tapInfo => {
                    var prepare = prepareRequest;
                    prepareRequest = false;
                    return [insertDrinkers, prepare, {
                        pourTime: new Date(body.sessionTime), 
                        personnelNumber: body.personnelNumber,
                        tapId: tapInfo.TapId,
                        kegId: tapInfo.KegId,
                        pourAmount: Number(body.Taps[tapInfo.TapId.toString()].amount)
                    }];
                });
            // Now decrement the available volume in each of our kegs
            sqlStatement = "UPDATE FactKegInstall " + 
                           "SET currentVolumeInML = currentVolumeInML - @pourAmount " + 
                           "WHERE KegId = @kegId";
            var updateKegVolume = new tedious.Request(sqlStatement, (error, rowCount, rows) => {
                if (error) {
                    return done(error, () => {
                        return output({code:500, msg: "Failed to update session activity: " + error});
                    });
                }
                if (requests.length == 0) {
                    // We're done - commit the xact
                    return done(null, () => {
                        return output({code:200, msg: newActivities.map(activity => { return {ActivityId: activity[0], KegId: activity[1]}; })});
                    });
                }
                nextRequest();
            });
            updateKegVolume.addParameter('pourAmount', tedious.TYPES.Decimal, 0.0);
            updateKegVolume.addParameter('kegId', tedious.TYPES.Int, 0);
            prepareRequest = true;
            requests = requests.concat(tapsResp.msg
                .filter(tapInfo => body.Taps[tapInfo.TapId.toString()] != null)
                .map(tapInfo => {
                    var prepare = prepareRequest;
                    prepareRequest = false;
                    return [updateKegVolume, prepare, {
                        kegId: tapInfo.KegId,
                        pourAmount: body.Taps[tapInfo.TapId.toString()].amount
                    }];
                }));
            nextRequest();
        });
    });
}