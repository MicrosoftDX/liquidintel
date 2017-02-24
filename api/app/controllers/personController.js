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
const aad = require("../../ad");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership((process.env.AuthorizedGroups || "").split(';'), token);
function getPersonByCardId(cardId, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] " +
                "FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber " +
                "WHERE c.CardKeyNbr = @card_id";
            let results = yield tds.default.sql(sqlStatement)
                .parameter('card_id', tedious_1.TYPES.Int, cardId)
                .executeImmediate();
            if (!results || results.length != 1) {
                return output({ code: 404, msg: "No person found having CardId: " + cardId });
            }
            else {
                let validUser = yield groupMembership.isUserMember(`${results[0].EmailName}@${process.env.Tenant}`);
                output({ code: 200, msg: {
                        'PersonnelNumber': results[0].PersonnelNumber,
                        'Valid': validUser,
                        'FullName': results[0].FullName
                    } });
            }
        }
        catch (ex) {
            return output({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getPersonByCardId = getPersonByCardId;
function getUserDetails(upn, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT u.PersonnelNumber, u.UserPrincipalName, u.UntappdAccessToken, u.CheckinFacebook, u.CheckinTwitter, u.CheckinFoursquare, " +
                "    p.FullName, p.FirstName, p.LastName " +
                "FROM dbo.Users u INNER JOIN HC01Person p ON u.PersonnelNumber = p.PersonnelNumber ";
            if (upn) {
                sqlStatement += "WHERE u.UserPrincipalName = @upn ";
            }
            sqlStatement += "ORDER BY p.FullName";
            var stmt = tds.default.sql(sqlStatement);
            if (upn) {
                stmt.parameter('upn', tedious_1.TYPES.NVarChar, upn);
            }
            var users = yield stmt.executeImmediate();
            if (upn && users.length == 0) {
                sqlStatement = "SELECT PersonnelNumber, EmailName, NULL as UntappdAccessToken, 0 as CheckinFacebook, 0 as CheckinTwitter, 0 as CheckinFoursquare, " +
                    "    FullName, FirstName, LastName " +
                    "FROM dbo.HC01Person " +
                    "WHERE EmailName = @alias";
                var user = yield tds.default.sql(sqlStatement)
                    .parameter('alias', tedious_1.TYPES.VarChar, upn.split('@')[0])
                    .executeImmediate();
                if (user.length == 1) {
                    output({ code: 200, msg: user[0] });
                }
                output({ code: 404, msg: 'User does not exist' });
            }
            else if (!upn) {
                output({ code: 200, msg: users });
            }
            else {
                output({ code: 200, msg: users[0] });
            }
        }
        catch (ex) {
            output({ code: 500, msg: 'Failed to retrieve user. Details: ' + ex });
        }
    });
}
exports.getUserDetails = getUserDetails;
function postUserDetails(upn, userDetails, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "MERGE dbo.Users " +
                "USING (" +
                "    VALUES(@personnelNumber, @userPrincipalName, @untappdAccessToken, @checkinFacebook, @checkinTwitter, @checkinFoursquare)" +
                ") AS source(PersonnelNumber, UserPrincipalName, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare) " +
                "ON Users.PersonnelNumber = source.PersonnelNumber " +
                "WHEN MATCHED THEN " +
                "    UPDATE SET UntappdAccessToken = source.UntappdAccessToken, " +
                "        CheckinFacebook = source.CheckinFacebook, " +
                "        CheckinTwitter = source.CheckinTwitter, " +
                "        CheckinFoursquare = source.CheckinFoursquare " +
                "WHEN NOT MATCHED THEN " +
                "    INSERT (PersonnelNumber, UserPrincipalName, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare) " +
                "    VALUES (source.PersonnelNumber, source.UserPrincipalName, source.UntappdAccessToken, source.CheckinFacebook, source.CheckinTwitter, source.CheckinFoursquare);";
            var results = yield tds.default.sql(sqlStatement)
                .parameter('personnelNumber', tedious_1.TYPES.Int, userDetails.PersonnelNumber)
                .parameter('userPrincipalName', tedious_1.TYPES.NVarChar, upn)
                .parameter('untappdAccessToken', tedious_1.TYPES.NVarChar, userDetails.UntappdAccessToken)
                .parameter('checkinFacebook', tedious_1.TYPES.Bit, userDetails.CheckinFacebook)
                .parameter('checkinTwitter', tedious_1.TYPES.Bit, userDetails.CheckinTwitter)
                .parameter('checkinFoursquare', tedious_1.TYPES.Bit, userDetails.CheckinFoursquare)
                .executeImmediate();
            getUserDetails(upn, output);
        }
        catch (ex) {
            output({ code: 500, msg: 'Failed to update user. Details: ' + ex });
        }
    });
}
exports.postUserDetails = postUserDetails;
//# sourceMappingURL=personController.js.map