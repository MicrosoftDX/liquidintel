
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';

export function getCurrentKeg_Internal(tapId: number): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
        try {
            var sqlStatement = "SELECT i.TapId, i.InstallDate, i.kegSizeInML, i.currentVolumeInML, " + 
                            "    k.Id as KegId, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
                            "    k.BeerDescription, k.UntappdId, k.imagePath " +
                            "FROM FactKegInstall i INNER JOIN DimKeg k ON i.KegId = k.Id " +
                            "WHERE i.isCurrent = 1 ";
            if (tapId != null) {
                sqlStatement += "AND i.TapId = @tap_id"
            }
            var stmt = tds.default.sql(sqlStatement);
            if (tapId != null) {
                stmt.parameter('tap_id', TYPES.Int, tapId);
            }
            let results = await stmt.executeImmediate();
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
    });
}

// This is the method callable via express routes - the outputFunc will send output to an express.Response object
export async function getCurrentKeg(tapId: number, outputFunc: (resp:any) => express.Response) {
    try {
        let results = await getCurrentKeg_Internal(tapId);
        if (tapId != null && results.length == 0) {
            outputFunc({code: 404, msg:'Current Keg(s) Not Found!'});
        }
        outputFunc({ code: 200, msg: results});
    }
    catch (ex) {
        outputFunc({code: 500, msg: ex});
    }
}

export async function getKeg(kegId: number, outputFunc: (resp:any) => express.Response) {
    try {
        var sqlStatement = "SELECT k.Id, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
                        "    k.BeerDescription, k.UntappdId, k.imagePath " +
                        "FROM DimKeg k ";
        if (kegId != null) {
            sqlStatement += "WHERE Id = @keg_id";
        }
        var stmt = tds.default.sql(sqlStatement);
        if (kegId != null) {
            stmt.parameter('keg_id', TYPES.Int, kegId);
        }
        let results = await stmt.executeImmediate();
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
            })});
    }
    catch (ex) {
        return outputFunc({code: 500, msg:'Internal Error: ' + ex});
    }
}

export function postNewKeg() {
    //TODO
}
    
export function postPreviouslyInstalledKeg(kegId, tapId, volumeInGallons, outputFunc){
}

//TODO
export function putKegFinished(tapId, outputFunc) {
    var markKegAsFinished = "UPDATE dbo.FactKegInstall SET isCurrent=0 WHERE tapId=@tap_id and isCurrent=1";
}
