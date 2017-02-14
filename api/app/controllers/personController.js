"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const tedious = require("tedious");
const aad = require("../../ad");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(process.env.AuthorizedGroups.split(';'), token);
function getPersonByCardId(cardId, connection, output) {
    var sqlStatement = "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] " +
        "FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber " +
        "WHERE c.CardKeyNbr = @card_id";
    var request = new tedious.Request(sqlStatement, (err, rowCount, rows) => __awaiter(this, void 0, void 0, function* () {
        if (err) {
            return output({ code: 500, msg: 'Internal Error: ' + err });
        }
        else if (rowCount == 0) {
            return output({ code: 404, msg: "No person found having CardId: " + cardId });
        }
        else {
            let validUser = yield groupMembership.isUserMember(`${rows[0].EmailName.value}@${process.env.Tenant}`);
            output({ code: 200, msg: {
                    'PersonnelNumber': rows[0].PersonnelNumber.value,
                    'Valid': validUser,
                    'FullName': rows[0].FullName.value
                } });
        }
    }));
    request.addParameter('card_id', tedious.TYPES.Int, cardId);
    connection.execSql(request);
}
exports.getPersonByCardId = getPersonByCardId;
//# sourceMappingURL=personController.js.map