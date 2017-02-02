var moment = require('moment')
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var env = require('dotenv').load();

module.exports = {
    getPersonByCardId: function(cardId, connection, output){
        var sqlStatement = "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber WHERE c.CardKeyNbr = @card_id";
        request = new Request(sqlStatement, function(err, rowCount, rows){
            if(err){
                return output({code: 500, msg:'Internal Error: '+err});
            }
            else if(rowCount==0){
                return output({code: 404, msg:"No person found having CardId: "+cardId});
            }
            else{
                jsonArray = [];
                rows.forEach(function (columns){
                    var rowObject = {};
                    columns.forEach(function (column){
                        rowObject[column.metadata.colName] = column.value;
                    });
                    jsonArray.push(rowObject);
                });
                var obj = {code: 200, msg: jsonArray}
                return output(obj);
            }
        });
        request.addParameter('card_id', TYPES.Int, cardId);
        connection.execSql(request);
    }

}