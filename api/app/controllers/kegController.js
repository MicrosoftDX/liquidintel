"use strict";
var tedious = require("tedious");
function getCurrentKeg_Internal(tapId, connection, outputFunc) {
    var sqlStatement = "SELECT i.TapId, i.InstallDate, i.kegSizeInML, i.currentVolumeInML, " +
        "    k.Id as KegId, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
        "    k.BeerDescription, k.UntappdId, k.imagePath " +
        "FROM FactKegInstall i INNER JOIN DimKeg k ON i.KegId = k.Id " +
        "WHERE i.isCurrent = 1 ";
    if (tapId != null) {
        sqlStatement += "AND i.TapId = @tap_id";
    }
    var request = new tedious.Request(sqlStatement, function (err, rowCount, rows) {
        if (err) {
            return outputFunc({ code: 500, msg: 'Internal Error: ' + err });
        }
        else if (rowCount == 0 && tapId != null) {
            return outputFunc({ code: 404, msg: 'Current Keg(s) Not Found!' });
        }
        else {
            return outputFunc({ code: 200, msg: rows.map(function (row) {
                    return {
                        'TapId': row.TapId.value,
                        'KegId': row.KegId.value,
                        'InstallDate': row.InstallDate.value,
                        'KegSize': row.kegSizeInML.value,
                        'CurrentVolume': row.currentVolumeInML.value,
                        'Name': row.Name.value,
                        'Brewery': row.Brewery.value,
                        'BeerType': row.BeerType.value,
                        'ABV': row.ABV.value,
                        'IBU': row.IBU.value,
                        'BeerDescription': row.BeerDescription.value,
                        'UntappdId': row.UntappdId.value,
                        'imagePath': row.imagePath.value
                    };
                }) });
        }
    });
    if (tapId != null) {
        request.addParameter('tap_id', tedious.TYPES.Int, tapId);
    }
    connection.execSql(request);
}
exports.getCurrentKeg_Internal = getCurrentKeg_Internal;
function getCurrentKeg(tapId, connection, outputFunc) {
    getCurrentKeg_Internal(tapId, connection, outputFunc);
}
exports.getCurrentKeg = getCurrentKeg;
function getKeg(kegId, connection, outputFunc) {
    var sqlStatement = "SELECT k.Id, k.Name, k.Brewery, k.BeerType, k.ABV, k.IBU, " +
        "    k.BeerDescription, k.UntappdId, k.imagePath " +
        "FROM DimKeg k ";
    if (kegId != null) {
        sqlStatement += "WHERE Id = @keg_id";
    }
    var request = new tedious.Request(sqlStatement, function (err, rowCount, rows) {
        if (err) {
            return outputFunc({ code: 500, msg: 'Internal Error: ' + err });
        }
        else {
            return outputFunc({ code: 200, msg: rows.map(function (row) {
                    return {
                        'KegId': row.Id.value,
                        'Name': row.Name.value,
                        'Brewery': row.Brewery.value,
                        'BeerType': row.BeerType.value,
                        'ABV': row.ABV.value,
                        'IBU': row.IBU.value,
                        'BeerDescription': row.BeerDescription.value,
                        'UntappdId': row.UntappdId.value,
                        'imagePath': row.imagePath.value
                    };
                }) });
        }
    });
    if (kegId != null) {
        request.addParameter('keg_id', tedious.TYPES.Int, kegId);
    }
    connection.execSql(request);
}
exports.getKeg = getKeg;
function postNewKeg() {
}
exports.postNewKeg = postNewKeg;
function postPreviouslyInstalledKeg(kegId, tapId, volumeInGallons, connection, outputFunc) {
    this.getKeg(kegId, connection, function (resp) {
        if (resp.code == 200) {
            this.putKegFinished(tapId, connection, function (out) {
                if (out.code == 200) {
                    var insertKeg = "INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (@keg_id, @install_date, @tap_id, @volume, 1)";
                    var volumeInML = Math.round(volumeInGallons * 3785.42);
                    var request = new tedious.Request(insertKeg, function (err, rowCount, rows) {
                        if (err) {
                            return outputFunc({ code: 500, msg: 'Internal Error: ' + err });
                        }
                        else if (rowCount == 0) {
                            return outputFunc({ code: 404, msg: 'Keg Not Found!' });
                        }
                        else {
                            return outputFunc({ code: 201, msg: "Keg installed successfully!" });
                        }
                    });
                    request.addParameter('keg_id', tedious.TYPES.Int, kegId);
                    request.addParameter('install_date', tedious.TYPES.DateTime2, tapId);
                    request.addParameter('tap_id', tedious.TYPES.Int, tapId);
                    request.addParameter('volume', tedious.TYPES.Int, volumeInML);
                    connection.execSql(request);
                }
                else {
                    return outputFunc({ code: out.code, msg: out.msg });
                }
            });
        }
        else {
            return outputFunc({ code: resp.code, msg: resp.msg });
        }
    });
}
exports.postPreviouslyInstalledKeg = postPreviouslyInstalledKeg;
function putKegFinished(tapId, connection, outputFunc) {
    var markKegAsFinished = "UPDATE dbo.FactKegInstall SET isCurrent=0 WHERE tapId=@tap_id and isCurrent=1";
    var request = new tedious.Request(markKegAsFinished, function (err, rowCount, rows) {
        if (err) {
            return outputFunc({ code: 500, msg: 'Internal Error: ' + err });
        }
        else {
            return outputFunc({ code: 201, msg: 'Recorded updated' });
        }
    });
    request.addParameter('tap_id', tedious.TYPES.Int, tapId);
    connection.execSql(request);
}
exports.putKegFinished = putKegFinished;
//# sourceMappingURL=kegController.js.map