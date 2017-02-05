var moment = require('moment')
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var env = require('dotenv').load();


module.exports = {
    getCurrentKeg: function(tapId, connection, outputFunc){
        var sqlStatement = "SELECT a.TapId, b.* from dbo.FactKegInstall a INNER JOIN dbo.DimKeg b ON a.KegId=b.Id where a.isCurrent=1 and a.TapId = @tap_id";
        if(tapId === null)
        {
            sqlStatement = "SELECT a.TapId, b.* from dbo.FactKegInstall a INNER JOIN dbo.DimKeg b ON a.KegId=b.Id where a.isCurrent=1";
        }
            var request = new Request(sqlStatement, function(err, rowCount, rows){
                if(err){
                    return outputFunc({code: 500, msg:'Internal Error: '+err});
                }
                else if(rowCount==0){
                    return outputFunc({code: 404, msg:'Current Keg(s) Not Found!'});
                }
                else{
                    var jsonArray = [];
                    rows.forEach(function (columns){
                        var rowObject = {};
                        columns.forEach(function (column){
                            rowObject[column.metadata.colName] = column.value;
                        });
                        jsonArray.push(rowObject);
                    });
                    var obj = {code: 200, msg: jsonArray}
                    return outputFunc(obj);
                }
            });
            request.addParameter('tap_id', TYPES.Int, tapId);
            connection.execSql(request);
    },

    getKeg: function(kegId, connection, outputFunc){
        var kegCheck = "SELECT * FROM dbo.DimKeg WHERE Id=@keg_id";
        if(kegId==null)
        {
            kegCheck = "SELECT * FROM dbo.DimKeg"
        }
        
        var request = new Request(kegCheck, function(err, rowCount, rows){
            if(err){
                return outputFunc({code: 500, msg:'Internal Error: '+err});
            }
            else if(rowCount==0){
                return outputFunc({code: 404, msg:'Keg Not Found!'});
            }
            else{
                var jsonArray = [];
                rows.forEach(function (columns){
                    var rowObject = {};
                    columns.forEach(function (column){
                        rowObject[column.metadata.colName] = column.value;
                        });
                    jsonArray.push(rowObject);
                });
                return outputFunc({code: 200, msg: jsonArray});
            }
        });

        if(kegId!=null){
            request.addParameter('keg_id', TYPES.Int, kegId);
        }
        connection.execSql(request);
    },

    postNewKeg: function() {
        //TODO
    },
    
    postPreviouslyInstalledKeg: function(kegId, tapId, volumeInGallons, connection, outputFunc){
        this.getKeg(kegId, connection, function(resp){
            if(resp.code==200)
            {
                this.putKegFinished(tapId, connection, function(out){
                    if(out.code==200)
                    {
                        //check what the 'Request' function looks like
                        var insertKeg = "INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (@keg_id, @install_date, @tap_id, @volume, 1)";
                        var volumeInML = Math.round(volumeInGallons * 3785.42);
                        var request = new Request(insertKeg, function(err, rowCount, rows){
                            if(err){
                                return outputFunc({code: 500, msg:'Internal Error: '+err});
                            }
                            else if(rowCount==0){
                                return outputFunc({code: 404, msg:'Keg Not Found!'});
                            }
                            else{
                                return outputFunc({code: 201, msg: "Keg installed successfully!"});
                            }
                        });
                        request.addParameter('keg_id', TYPES.Int, kegId);
                        request.addParameter('install_date', TYPES.DateTime2, tapId);
                        request.addParameter('tap_id', TYPES.Int, tapId);
                        request.addParameter('volume', TYPES.Int, volumeInML);
                        connection.execSql(request);
                    }
                    else{
                        return outputFunc({code: out.code, msg: out.msg});
                    }
                }); 
            }
            else
            {
                return outputFunc({code: resp.code, msg: resp.msg});
            }
        }); 
    },

//TODO
    putKegFinished: function(tapId, connection, outputFunc){
        var markKegAsFinished = "UPDATE dbo.FactKegInstall SET isCurrent=0 WHERE tapId=@tap_id and isCurrent=1";
        var request = new Request(markKegAsFinished, function(err, rowCount, rows){
            if(err){
                    return outputFunc({code: 500, msg:'Internal Error: '+err});
                }
                else{
                    return outputFunc({code: 201, msg:'Recorded updated'});
                }
        });
        request.addParameter('tap_id', TYPES.Int, tapId);
        connection.execSql(request);
    }
}