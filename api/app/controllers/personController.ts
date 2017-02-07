
import express = require('express');
import tedious = require('tedious');

export function getPersonByCardId(cardId: number, connection: tedious.Connection, output: (resp:any) => express.Response) {
    var sqlStatement = 
        "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] " +
        "FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber " +
        "WHERE c.CardKeyNbr = @card_id";
    var request = new tedious.Request(sqlStatement, (err, rowCount, rows) => {
        if (err) {
            return output({code: 500, msg:'Internal Error: '+err});
        }
        else if (rowCount == 0) {
            return output({code: 404, msg:"No person found having CardId: "+cardId});
        }
        else {
            return output({code: 200, msg: {
                'PersonnelNumber':rows[0].PersonnelNumber.value,
                'Valid':true,
                'FullName':rows[0].FullName.value
            }});
        }
    });
    request.addParameter('card_id', tedious.TYPES.Int, cardId);
    connection.execSql(request);
}
