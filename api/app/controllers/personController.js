"use strict";
var tedious = require("tedious");
var aad = require("../../ad");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(process.env.AuthorizedGroups.split(';'), token);
function getPersonByCardId(cardId, connection, output) {
    var sqlStatement = "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] " +
        "FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber " +
        "WHERE c.CardKeyNbr = @card_id";
    var request = new tedious.Request(sqlStatement, function (err, rowCount, rows) {
        if (err) {
            return output({ code: 500, msg: 'Internal Error: ' + err });
        }
        else if (rowCount == 0) {
            return output({ code: 404, msg: "No person found having CardId: " + cardId });
        }
        else {
            groupMembership.isUserMember(rows[0].EmailName.value + "@" + process.env.Tenant, function (err, result) {
                output({ code: 200, msg: {
                        'PersonnelNumber': rows[0].PersonnelNumber.value,
                        'Valid': result,
                        'FullName': rows[0].FullName.value
                    } });
            });
        }
    });
    request.addParameter('card_id', tedious.TYPES.Int, cardId);
    connection.execSql(request);
}
exports.getPersonByCardId = getPersonByCardId;
//# sourceMappingURL=personController.js.map