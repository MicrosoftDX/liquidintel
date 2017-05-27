"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tds = require("../utils/tds-promises");
const tedious_1 = require("tedious");
const aad = require("../utils/ad");
const settings = require("../utils/settings_encoder");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(settings.decodeSettingArray(process.env.AuthorizedGroups), token);
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
                        PersonnelNumber: results[0].PersonnelNumber,
                        Valid: validUser,
                        FullName: results[0].FullName
                    } });
            }
        }
        catch (ex) {
            return output({ code: 500, msg: 'Internal Error: ' + ex });
        }
    });
}
exports.getPersonByCardId = getPersonByCardId;
function getValidPeople(cardId, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let groupMembers = yield groupMembership.getMembers();
            var sqlStatement = "dbo.GetValidPeople";
            var tvp = {
                name: 'EmailAliases',
                columns: [{
                        name: 'EmailAlias',
                        type: tedious_1.TYPES.VarChar
                    }],
                rows: groupMembers.map(member => {
                    return [member.userPrincipalName.split('@')[0]];
                })
            };
            let results = yield tds.default.sql(sqlStatement)
                .parameter('aliases', tedious_1.TYPES.TVP, tvp)
                .execute(true, true);
            return output({ code: 200, msg: results.map(member => {
                    return {
                        PersonnelNumber: member.PersonnelNumber,
                        Valid: true,
                        FullName: member.FullName,
                        CardId: member.CardKeyNbr
                    };
                }) });
        }
        catch (ex) {
            console.warn('Failed to retrieve list of valid people. Details: ' + ex);
            return output({ code: 500, msg: 'Internal error: ' + ex.stack });
        }
    });
}
exports.getValidPeople = getValidPeople;
function getUserDetails(upn, isAdmin, tokenUpn, output, successResponse = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (upn && upn.toLowerCase() === 'me') {
                upn = tokenUpn;
            }
            else if (!isAdmin) {
                if (upn && upn.toLowerCase() !== tokenUpn.toLowerCase()) {
                    return output({ code: 400, msg: 'Caller can only request own user information.' });
                }
                upn = upn || tokenUpn;
            }
            var sqlStatement = "SELECT u.PersonnelNumber, u.UserPrincipalName, u.UntappdUserName, u.UntappdAccessToken, u.CheckinFacebook, u.CheckinTwitter, u.CheckinFoursquare, u.ThumbnailImageUri, " +
                "    p.FullName, p.FirstName, p.LastName, @isAdmin AS IsAdmin " +
                "FROM dbo.Users u INNER JOIN HC01Person p ON u.PersonnelNumber = p.PersonnelNumber ";
            if (upn) {
                sqlStatement += "WHERE u.UserPrincipalName = @upn ";
            }
            sqlStatement += "ORDER BY p.FullName";
            var stmt = tds.default.sql(sqlStatement)
                .parameter('isAdmin', tedious_1.TYPES.Bit, isAdmin);
            if (upn) {
                stmt.parameter('upn', tedious_1.TYPES.NVarChar, upn);
            }
            var users = yield stmt.executeImmediate();
            if (upn && users.length == 0) {
                sqlStatement = "SELECT PersonnelNumber, EmailName, NULL as UntappdUserName, NULL as UntappdAccessToken, 0 as CheckinFacebook, 0 as CheckinTwitter, 0 as CheckinFoursquare, NULL as ThumbnailImageUri, " +
                    "    FullName, FirstName, LastName, @isAdmin as IsAdmin " +
                    "FROM dbo.HC01Person " +
                    "WHERE EmailName = @alias";
                var user = yield tds.default.sql(sqlStatement)
                    .parameter('isAdmin', tedious_1.TYPES.Bit, isAdmin)
                    .parameter('alias', tedious_1.TYPES.VarChar, upn.split('@')[0])
                    .executeImmediate();
                if (user.length == 1) {
                    output({ code: successResponse, msg: user[0] });
                }
                output({ code: 404, msg: 'User does not exist' });
            }
            else if (!upn) {
                output({ code: successResponse, msg: users });
            }
            else {
                output({ code: successResponse, msg: users[0] });
            }
        }
        catch (ex) {
            console.warn('Failed to retrieve user. Details: ' + ex);
            output({ code: 500, msg: 'Failed to retrieve user. Details: ' + ex });
        }
    });
}
exports.getUserDetails = getUserDetails;
function postUserDetails(upn, isAdmin, tokenUpn, userDetails, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (upn && upn.toLowerCase() === 'me') {
                upn = tokenUpn;
            }
            else if (!isAdmin) {
                if (upn && upn.toLowerCase() !== tokenUpn.toLowerCase()) {
                    return output({ code: 400, msg: 'Caller can only update own user information.' });
                }
            }
            upn = upn || tokenUpn;
            if (userDetails.UserPrincipalName && upn.toLowerCase() !== userDetails.UserPrincipalName.toLowerCase()) {
                return output({ code: 400, msg: 'UserPrincipalName in payload MUST match resource name' });
            }
            var sqlStatement = "MERGE dbo.Users " +
                "USING (" +
                "    VALUES(@personnelNumber, @userPrincipalName, @untappdUserName, @untappdAccessToken, @checkinFacebook, @checkinTwitter, @checkinFoursquare, @thumbnailImageUri)" +
                ") AS source(PersonnelNumber, UserPrincipalName, UntappdUserName, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare, ThumbnailImageUri) " +
                "ON Users.PersonnelNumber = source.PersonnelNumber " +
                "WHEN MATCHED THEN " +
                "    UPDATE SET UntappdUserName = source.UntappdUserName, " +
                "        UntappdAccessToken = source.UntappdAccessToken, " +
                "        CheckinFacebook = source.CheckinFacebook, " +
                "        CheckinTwitter = source.CheckinTwitter, " +
                "        CheckinFoursquare = source.CheckinFoursquare, " +
                "        ThumbnailImageUri = source.ThumbnailImageUri " +
                "WHEN NOT MATCHED THEN " +
                "    INSERT (PersonnelNumber, UserPrincipalName, UntappdUserName, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare, ThumbnailImageUri) " +
                "    VALUES (source.PersonnelNumber, source.UserPrincipalName, source.UntappdUserName, source.UntappdAccessToken, source.CheckinFacebook, source.CheckinTwitter, source.CheckinFoursquare, source.ThumbnailImageUri);";
            var results = yield tds.default.sql(sqlStatement)
                .parameter('personnelNumber', tedious_1.TYPES.Int, userDetails.PersonnelNumber)
                .parameter('userPrincipalName', tedious_1.TYPES.NVarChar, upn)
                .parameter('untappdUserName', tedious_1.TYPES.NVarChar, userDetails.UntappdUserName)
                .parameter('untappdAccessToken', tedious_1.TYPES.NVarChar, userDetails.UntappdAccessToken)
                .parameter('checkinFacebook', tedious_1.TYPES.Bit, userDetails.CheckinFacebook)
                .parameter('checkinTwitter', tedious_1.TYPES.Bit, userDetails.CheckinTwitter)
                .parameter('checkinFoursquare', tedious_1.TYPES.Bit, userDetails.CheckinFoursquare)
                .parameter('thumbnailImageUri', tedious_1.TYPES.NVarChar, userDetails.ThumbnailImageUri)
                .executeImmediate();
            getUserDetails(upn, false, upn, output, 201);
        }
        catch (ex) {
            console.warn('Failed to update user. Details: ' + ex);
            output({ code: 500, msg: 'Failed to update user. Details: ' + ex });
        }
    });
}
exports.postUserDetails = postUserDetails;
//# sourceMappingURL=personController.js.map