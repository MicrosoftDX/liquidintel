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
            return output({ code: 500, msg: 'Internal error: ' + ex });
        }
    });
}
exports.getValidPeople = getValidPeople;
function getUserDetails(upn, isAdmin, tokenUpn, output) {
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
            var sqlStatement = "SELECT u.PersonnelNumber, u.UserPrincipalName, u.UntappdUserName, u.CheckinFacebook, u.CheckinTwitter, u.CheckinFoursquare, u.ThumbnailImageUri, " +
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
                sqlStatement = "SELECT PersonnelNumber, EmailName, NULL as UntappdUserName, 0 as CheckinFacebook, 0 as CheckinTwitter, 0 as CheckinFoursquare, NULL as ThumbnailImageUri, " +
                    "    FullName, FirstName, LastName, @isAdmin as IsAdmin " +
                    "FROM dbo.HC01Person " +
                    "WHERE EmailName = @alias";
                var user = yield tds.default.sql(sqlStatement)
                    .parameter('isAdmin', tedious_1.TYPES.Bit, isAdmin)
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
            getUserDetails(upn, false, upn, output);
        }
        catch (ex) {
            console.warn('Failed to update user. Details: ' + ex);
            output({ code: 500, msg: 'Failed to update user. Details: ' + ex });
        }
    });
}
exports.postUserDetails = postUserDetails;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9jb250cm9sbGVycy9wZXJzb25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSw2Q0FBOEM7QUFDOUMscUNBQThCO0FBQzlCLGdDQUFnQztBQUVoQyxJQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM5RixJQUFJLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRTNHLDJCQUF3QyxNQUFjLEVBQUUsTUFBc0M7O1FBQzFGLElBQUksQ0FBQztZQUNELElBQUksWUFBWSxHQUNaLDBEQUEwRDtnQkFDMUQsNEdBQTRHO2dCQUM1RywrQkFBK0IsQ0FBQztZQUNwQyxJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztpQkFDNUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxlQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztpQkFDdkMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBQyxpQ0FBaUMsR0FBRyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFFRixJQUFJLFNBQVMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDcEcsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7d0JBQ3BCLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTt3QkFDM0MsS0FBSyxFQUFFLFNBQVM7d0JBQ2hCLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTtxQkFDaEMsRUFBQyxDQUFDLENBQUM7WUFDUixDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUMsa0JBQWtCLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBekJELDhDQXlCQztBQUVELHdCQUFxQyxNQUFjLEVBQUUsTUFBc0M7O1FBQ3ZGLElBQUksQ0FBQztZQUNELElBQUksWUFBWSxHQUFHLE1BQU0sZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBR3RELElBQUksWUFBWSxHQUFHLG9CQUFvQixDQUFDO1lBQ3hDLElBQUksR0FBRyxHQUFHO2dCQUNOLElBQUksRUFBRSxjQUFjO2dCQUNwQixPQUFPLEVBQUUsQ0FBQzt3QkFDTixJQUFJLEVBQUUsWUFBWTt3QkFDbEIsSUFBSSxFQUFFLGVBQUssQ0FBQyxPQUFPO3FCQUN0QixDQUFDO2dCQUNGLElBQUksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU07b0JBQ3pCLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDO2FBQ0wsQ0FBQztZQUNGLElBQUksT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO2lCQUM1QyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2lCQUNwQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXpCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07b0JBQzVDLE1BQU0sQ0FBQzt3QkFDSCxlQUFlLEVBQUUsTUFBTSxDQUFDLGVBQWU7d0JBQ3ZDLEtBQUssRUFBRSxJQUFJO3dCQUNYLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTt3QkFDekIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVO3FCQUM1QixDQUFBO2dCQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUNULENBQUM7UUFDRCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxvREFBb0QsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBakNELHdDQWlDQztBQUVELHdCQUFxQyxHQUFXLEVBQUUsT0FBZ0IsRUFBRSxRQUFnQixFQUFFLE1BQXVDOztRQUN6SCxJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDbkIsQ0FBQztZQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRWhCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLCtDQUErQyxFQUFDLENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFDRCxHQUFHLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQztZQUMxQixDQUFDO1lBR0QsSUFBSSxZQUFZLEdBQUcsbUpBQW1KO2dCQUNuSiwrREFBK0Q7Z0JBQy9ELG9GQUFvRixDQUFDO1lBQ3hHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sWUFBWSxJQUFJLG1DQUFtQyxDQUFDO1lBQ3hELENBQUM7WUFDRCxZQUFZLElBQUkscUJBQXFCLENBQUM7WUFDdEMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO2lCQUNuQyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxlQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFDRCxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLFlBQVksR0FBRyw0SkFBNEo7b0JBQzVKLHlEQUF5RDtvQkFDekQsc0JBQXNCO29CQUN0QiwwQkFBMEIsQ0FBQztnQkFDMUMsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7cUJBQ3pDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsZUFBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7cUJBQ3hDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsZUFBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwRCxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUscUJBQXFCLEVBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNMLENBQUM7UUFDRCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxvQ0FBb0MsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7SUFDTCxDQUFDO0NBQUE7QUFyREQsd0NBcURDO0FBRUQseUJBQXNDLEdBQVcsRUFBRSxPQUFnQixFQUFFLFFBQWdCLEVBQUUsV0FBVyxFQUFFLE1BQXVDOztRQUN2SSxJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDbkIsQ0FBQztZQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRWhCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLDhDQUE4QyxFQUFDLENBQUMsQ0FBQztnQkFDcEYsQ0FBQztZQUNMLENBQUM7WUFDRCxHQUFHLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQztZQUN0QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSx1REFBdUQsRUFBQyxDQUFDLENBQUM7WUFDNUYsQ0FBQztZQUNELElBQUksWUFBWSxHQUFHLGtCQUFrQjtnQkFDbEIsU0FBUztnQkFDVCxvS0FBb0s7Z0JBQ3BLLDhKQUE4SjtnQkFDOUosb0RBQW9EO2dCQUNwRCxvQkFBb0I7Z0JBQ3BCLDJEQUEyRDtnQkFDM0QsMERBQTBEO2dCQUMxRCxvREFBb0Q7Z0JBQ3BELGtEQUFrRDtnQkFDbEQsd0RBQXdEO2dCQUN4RCx1REFBdUQ7Z0JBQ3ZELHdCQUF3QjtnQkFDeEIsOEpBQThKO2dCQUM5SixzTkFBc04sQ0FBQztZQUMxTyxJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztpQkFDNUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLGVBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQztpQkFDcEUsU0FBUyxDQUFDLG1CQUFtQixFQUFFLGVBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO2lCQUNuRCxTQUFTLENBQUMsaUJBQWlCLEVBQUUsZUFBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDO2lCQUN6RSxTQUFTLENBQUMsb0JBQW9CLEVBQUUsZUFBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsa0JBQWtCLENBQUM7aUJBQy9FLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxlQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUM7aUJBQ3BFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7aUJBQ2xFLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxlQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDeEUsU0FBUyxDQUFDLG1CQUFtQixFQUFFLGVBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLGlCQUFpQixDQUFDO2lCQUM3RSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLGNBQWMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsa0NBQWtDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBOUNELDBDQThDQyIsImZpbGUiOiJhcHAvY29udHJvbGxlcnMvcGVyc29uQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcclxuaW1wb3J0IHRkcyA9IHJlcXVpcmUoJy4uL3V0aWxzL3Rkcy1wcm9taXNlcycpO1xyXG5pbXBvcnQge1RZUEVTfSBmcm9tICd0ZWRpb3VzJztcclxuaW1wb3J0IGFhZCA9IHJlcXVpcmUoJy4uLy4uL2FkJylcclxuXHJcbnZhciB0b2tlbiA9IG5ldyBhYWQuVG9rZW4ocHJvY2Vzcy5lbnYuVGVuYW50LCBwcm9jZXNzLmVudi5DbGllbnRJZCwgcHJvY2Vzcy5lbnYuQ2xpZW50U2VjcmV0KTtcclxudmFyIGdyb3VwTWVtYmVyc2hpcCA9IG5ldyBhYWQuR3JhcGhHcm91cE1lbWJlcnNoaXAoKHByb2Nlc3MuZW52LkF1dGhvcml6ZWRHcm91cHMgfHwgXCJcIikuc3BsaXQoJzsnKSwgdG9rZW4pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcnNvbkJ5Q2FyZElkKGNhcmRJZDogbnVtYmVyLCBvdXRwdXQ6IChyZXNwOmFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXHJcbiAgICAgICAgICAgIFwiU0VMRUNUIHAuW1BlcnNvbm5lbE51bWJlcl0sIHAuW0VtYWlsTmFtZV0sIHAuW0Z1bGxOYW1lXSBcIiArXHJcbiAgICAgICAgICAgIFwiRlJPTSBkYm8uW0NBUkQwMkNhcmRLZXlNYXBwaW5nU10gYyBJTk5FUiBKT0lOIGRiby5bSEMwMVBlcnNvbl0gcCBPTiBjLlNBUFBlcnNvbm5lbE5iciA9IHAuUGVyc29ubmVsTnVtYmVyIFwiICtcclxuICAgICAgICAgICAgXCJXSEVSRSBjLkNhcmRLZXlOYnIgPSBAY2FyZF9pZFwiO1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignY2FyZF9pZCcsIFRZUEVTLkludCwgY2FyZElkKVxyXG4gICAgICAgICAgICAuZXhlY3V0ZUltbWVkaWF0ZSgpO1xyXG4gICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCAhPSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQoe2NvZGU6IDQwNCwgbXNnOlwiTm8gcGVyc29uIGZvdW5kIGhhdmluZyBDYXJkSWQ6IFwiICsgY2FyZElkfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBQZXJmb3JtIGFuIEFBRCBsb29rdXAgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgdXNlciBpcyBhIHRyYW5zaXRpdmUgbWVtYmVyIG9mIGFueSBvZiBvdXIgY29uZmlndXJlZCBncm91cHNcclxuICAgICAgICAgICAgbGV0IHZhbGlkVXNlciA9IGF3YWl0IGdyb3VwTWVtYmVyc2hpcC5pc1VzZXJNZW1iZXIoYCR7cmVzdWx0c1swXS5FbWFpbE5hbWV9QCR7cHJvY2Vzcy5lbnYuVGVuYW50fWApO1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IDIwMCwgbXNnOiB7XHJcbiAgICAgICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IHJlc3VsdHNbMF0uUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgVmFsaWQ6IHZhbGlkVXNlcixcclxuICAgICAgICAgICAgICAgIEZ1bGxOYW1lOiByZXN1bHRzWzBdLkZ1bGxOYW1lXHJcbiAgICAgICAgICAgIH19KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOiA1MDAsIG1zZzonSW50ZXJuYWwgRXJyb3I6ICcgKyBleH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmFsaWRQZW9wbGUoY2FyZElkOiBudW1iZXIsIG91dHB1dDogKHJlc3A6YW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBncm91cE1lbWJlcnMgPSBhd2FpdCBncm91cE1lbWJlcnNoaXAuZ2V0TWVtYmVycygpO1xyXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZ28gdG8gdGhlIGRhdGFiYXNlIHRvIGdldCB0aGUgY2FyZCAjLiBXZSB1c2UgYSB0YWJsZS12YWx1ZWQgcGFyYW1ldGVyIHRvIGxpbWl0IHRoZSBlbWFpbCBhZGRyZXNzZXNcclxuICAgICAgICAvLyAmIGEgc3Byb2MgYmVjYXVzZSB0ZWRpb3VzIGNhbiBvbmx5IGJpbmQgVFZQcyB0byBzcHJvYyBpbnZvY2F0aW9ucy5cclxuICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXCJkYm8uR2V0VmFsaWRQZW9wbGVcIjtcclxuICAgICAgICB2YXIgdHZwID0ge1xyXG4gICAgICAgICAgICBuYW1lOiAnRW1haWxBbGlhc2VzJyxcclxuICAgICAgICAgICAgY29sdW1uczogW3tcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdFbWFpbEFsaWFzJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFRZUEVTLlZhckNoYXJcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHJvd3M6IGdyb3VwTWVtYmVycy5tYXAobWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbbWVtYmVyLnVzZXJQcmluY2lwYWxOYW1lLnNwbGl0KCdAJylbMF1dO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBhd2FpdCB0ZHMuZGVmYXVsdC5zcWwoc3FsU3RhdGVtZW50KVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdhbGlhc2VzJywgVFlQRVMuVFZQLCB0dnApXHJcbiAgICAgICAgICAgIC5leGVjdXRlKHRydWUsIHRydWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOjIwMCwgbXNnOiByZXN1bHRzLm1hcChtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgUGVyc29ubmVsTnVtYmVyOiBtZW1iZXIuUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBGdWxsTmFtZTogbWVtYmVyLkZ1bGxOYW1lLFxyXG4gICAgICAgICAgICAgICAgQ2FyZElkOiBtZW1iZXIuQ2FyZEtleU5iclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSl9KTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIHJldHJpZXZlIGxpc3Qgb2YgdmFsaWQgcGVvcGxlLiBEZXRhaWxzOiAnICsgZXgpO1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQoe2NvZGU6IDUwMCwgbXNnOiAnSW50ZXJuYWwgZXJyb3I6ICcgKyBleH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckRldGFpbHModXBuOiBzdHJpbmcsIGlzQWRtaW46IGJvb2xlYW4sIHRva2VuVXBuOiBzdHJpbmcsIG91dHB1dDogKHJlc3A6IGFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAodXBuICYmIHVwbi50b0xvd2VyQ2FzZSgpID09PSAnbWUnKSB7XHJcbiAgICAgICAgICAgIHVwbiA9IHRva2VuVXBuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaXNBZG1pbikge1xyXG4gICAgICAgICAgICAvLyBOb24tYWRtaW4gdXNlcnMgY2FuIG9ubHkgYXNrIGZvciB0aGVpciBvd24gaW5mb1xyXG4gICAgICAgICAgICBpZiAodXBuICYmIHVwbi50b0xvd2VyQ2FzZSgpICE9PSB0b2tlblVwbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOiA0MDAsIG1zZzogJ0NhbGxlciBjYW4gb25seSByZXF1ZXN0IG93biB1c2VyIGluZm9ybWF0aW9uLid9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cG4gPSB1cG4gfHwgdG9rZW5VcG47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE5vdGUgdGhhdCBpZiBhbiBhZG1pbiBpcyBhc2tpbmcgZm9yIGV2ZXJ5b25lLCB3ZSBkb24ndCBhdWdtZW50IGNvcnJlY3RseSB3aXRoIHRoZSBJc0FkbWluIGZsYWcuIFRoaXMgaXMgdG8gYXZvaWQgdGhlIGxhdGVuY3lcclxuICAgICAgICAvLyBvdmVyaGVhZCBvZiBsb29rdXAgdXAgZXZlcnlvbmUgYWdhaW5zdCBBQUQuXHJcbiAgICAgICAgdmFyIHNxbFN0YXRlbWVudCA9IFwiU0VMRUNUIHUuUGVyc29ubmVsTnVtYmVyLCB1LlVzZXJQcmluY2lwYWxOYW1lLCB1LlVudGFwcGRVc2VyTmFtZSwgdS5DaGVja2luRmFjZWJvb2ssIHUuQ2hlY2tpblR3aXR0ZXIsIHUuQ2hlY2tpbkZvdXJzcXVhcmUsIHUuVGh1bWJuYWlsSW1hZ2VVcmksIFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgIHAuRnVsbE5hbWUsIHAuRmlyc3ROYW1lLCBwLkxhc3ROYW1lLCBAaXNBZG1pbiBBUyBJc0FkbWluIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGUk9NIGRiby5Vc2VycyB1IElOTkVSIEpPSU4gSEMwMVBlcnNvbiBwIE9OIHUuUGVyc29ubmVsTnVtYmVyID0gcC5QZXJzb25uZWxOdW1iZXIgXCI7XHJcbiAgICAgICAgaWYgKHVwbikgeyAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzcWxTdGF0ZW1lbnQgKz0gXCJXSEVSRSB1LlVzZXJQcmluY2lwYWxOYW1lID0gQHVwbiBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3FsU3RhdGVtZW50ICs9IFwiT1JERVIgQlkgcC5GdWxsTmFtZVwiO1xyXG4gICAgICAgIHZhciBzdG10ID0gdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignaXNBZG1pbicsIFRZUEVTLkJpdCwgaXNBZG1pbik7XHJcbiAgICAgICAgaWYgKHVwbikge1xyXG4gICAgICAgICAgICBzdG10LnBhcmFtZXRlcigndXBuJywgVFlQRVMuTlZhckNoYXIsIHVwbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB1c2VycyA9IGF3YWl0IHN0bXQuZXhlY3V0ZUltbWVkaWF0ZSgpO1xyXG4gICAgICAgIGlmICh1cG4gJiYgdXNlcnMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgLy8gVHJ5IGRpcmVjdGx5IGFnYWluc3QgdGhlIEhDMDFQZXJzb24gdGFibGVcclxuICAgICAgICAgICAgc3FsU3RhdGVtZW50ID0gXCJTRUxFQ1QgUGVyc29ubmVsTnVtYmVyLCBFbWFpbE5hbWUsIE5VTEwgYXMgVW50YXBwZFVzZXJOYW1lLCAwIGFzIENoZWNraW5GYWNlYm9vaywgMCBhcyBDaGVja2luVHdpdHRlciwgMCBhcyBDaGVja2luRm91cnNxdWFyZSwgTlVMTCBhcyBUaHVtYm5haWxJbWFnZVVyaSwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBGdWxsTmFtZSwgRmlyc3ROYW1lLCBMYXN0TmFtZSwgQGlzQWRtaW4gYXMgSXNBZG1pbiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRlJPTSBkYm8uSEMwMVBlcnNvbiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV0hFUkUgRW1haWxOYW1lID0gQGFsaWFzXCI7XHJcbiAgICAgICAgICAgIHZhciB1c2VyID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ2lzQWRtaW4nLCBUWVBFUy5CaXQsIGlzQWRtaW4pXHJcbiAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCdhbGlhcycsIFRZUEVTLlZhckNoYXIsIHVwbi5zcGxpdCgnQCcpWzBdKVxyXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVJbW1lZGlhdGUoKTtcclxuICAgICAgICAgICAgaWYgKHVzZXIubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dCh7Y29kZToyMDAsIG1zZzogdXNlclswXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHB1dCh7Y29kZTogNDA0LCBtc2c6ICdVc2VyIGRvZXMgbm90IGV4aXN0J30pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdXBuKSB7XHJcbiAgICAgICAgICAgIG91dHB1dCh7Y29kZTogMjAwLCBtc2c6IHVzZXJzfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IDIwMCwgbXNnOiB1c2Vyc1swXX0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIHJldHJpZXZlIHVzZXIuIERldGFpbHM6ICcgKyBleCk7XHJcbiAgICAgICAgb3V0cHV0KHtjb2RlOjUwMCwgbXNnOiAnRmFpbGVkIHRvIHJldHJpZXZlIHVzZXIuIERldGFpbHM6ICcgKyBleH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdFVzZXJEZXRhaWxzKHVwbjogc3RyaW5nLCBpc0FkbWluOiBib29sZWFuLCB0b2tlblVwbjogc3RyaW5nLCB1c2VyRGV0YWlscywgb3V0cHV0OiAocmVzcDogYW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmICh1cG4gJiYgdXBuLnRvTG93ZXJDYXNlKCkgPT09ICdtZScpIHtcclxuICAgICAgICAgICAgdXBuID0gdG9rZW5VcG47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFpc0FkbWluKSB7XHJcbiAgICAgICAgICAgIC8vIE5vbi1hZG1pbiB1c2VycyBjYW4gb25seSBhc2sgZm9yIHRoZWlyIG93biBpbmZvXHJcbiAgICAgICAgICAgIGlmICh1cG4gJiYgdXBuLnRvTG93ZXJDYXNlKCkgIT09IHRva2VuVXBuLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQoe2NvZGU6IDQwMCwgbXNnOiAnQ2FsbGVyIGNhbiBvbmx5IHVwZGF0ZSBvd24gdXNlciBpbmZvcm1hdGlvbi4nfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdXBuID0gdXBuIHx8IHRva2VuVXBuO1xyXG4gICAgICAgIGlmICh1c2VyRGV0YWlscy5Vc2VyUHJpbmNpcGFsTmFtZSAmJiB1cG4udG9Mb3dlckNhc2UoKSAhPT0gdXNlckRldGFpbHMuVXNlclByaW5jaXBhbE5hbWUudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOjQwMCwgbXNnOiAnVXNlclByaW5jaXBhbE5hbWUgaW4gcGF5bG9hZCBNVVNUIG1hdGNoIHJlc291cmNlIG5hbWUnfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzcWxTdGF0ZW1lbnQgPSBcIk1FUkdFIGRiby5Vc2VycyBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVVNJTkcgKFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgVkFMVUVTKEBwZXJzb25uZWxOdW1iZXIsIEB1c2VyUHJpbmNpcGFsTmFtZSwgQHVudGFwcGRVc2VyTmFtZSwgQHVudGFwcGRBY2Nlc3NUb2tlbiwgQGNoZWNraW5GYWNlYm9vaywgQGNoZWNraW5Ud2l0dGVyLCBAY2hlY2tpbkZvdXJzcXVhcmUsIEB0aHVtYm5haWxJbWFnZVVyaSlcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiKSBBUyBzb3VyY2UoUGVyc29ubmVsTnVtYmVyLCBVc2VyUHJpbmNpcGFsTmFtZSwgVW50YXBwZFVzZXJOYW1lLCBVbnRhcHBkQWNjZXNzVG9rZW4sIENoZWNraW5GYWNlYm9vaywgQ2hlY2tpblR3aXR0ZXIsIENoZWNraW5Gb3Vyc3F1YXJlLCBUaHVtYm5haWxJbWFnZVVyaSkgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIk9OIFVzZXJzLlBlcnNvbm5lbE51bWJlciA9IHNvdXJjZS5QZXJzb25uZWxOdW1iZXIgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIldIRU4gTUFUQ0hFRCBUSEVOIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgVVBEQVRFIFNFVCBVbnRhcHBkVXNlck5hbWUgPSBzb3VyY2UuVW50YXBwZFVzZXJOYW1lLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgICAgICBVbnRhcHBkQWNjZXNzVG9rZW4gPSBzb3VyY2UuVW50YXBwZEFjY2Vzc1Rva2VuLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgICAgICBDaGVja2luRmFjZWJvb2sgPSBzb3VyY2UuQ2hlY2tpbkZhY2Vib29rLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgICAgICBDaGVja2luVHdpdHRlciA9IHNvdXJjZS5DaGVja2luVHdpdHRlciwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICAgICAgQ2hlY2tpbkZvdXJzcXVhcmUgPSBzb3VyY2UuQ2hlY2tpbkZvdXJzcXVhcmUsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgICAgIFRodW1ibmFpbEltYWdlVXJpID0gc291cmNlLlRodW1ibmFpbEltYWdlVXJpIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJXSEVOIE5PVCBNQVRDSEVEIFRIRU4gXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBJTlNFUlQgKFBlcnNvbm5lbE51bWJlciwgVXNlclByaW5jaXBhbE5hbWUsIFVudGFwcGRVc2VyTmFtZSwgVW50YXBwZEFjY2Vzc1Rva2VuLCBDaGVja2luRmFjZWJvb2ssIENoZWNraW5Ud2l0dGVyLCBDaGVja2luRm91cnNxdWFyZSwgVGh1bWJuYWlsSW1hZ2VVcmkpIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgVkFMVUVTIChzb3VyY2UuUGVyc29ubmVsTnVtYmVyLCBzb3VyY2UuVXNlclByaW5jaXBhbE5hbWUsIHNvdXJjZS5VbnRhcHBkVXNlck5hbWUsIHNvdXJjZS5VbnRhcHBkQWNjZXNzVG9rZW4sIHNvdXJjZS5DaGVja2luRmFjZWJvb2ssIHNvdXJjZS5DaGVja2luVHdpdHRlciwgc291cmNlLkNoZWNraW5Gb3Vyc3F1YXJlLCBzb3VyY2UuVGh1bWJuYWlsSW1hZ2VVcmkpO1wiO1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLnBhcmFtZXRlcigncGVyc29ubmVsTnVtYmVyJywgVFlQRVMuSW50LCB1c2VyRGV0YWlscy5QZXJzb25uZWxOdW1iZXIpXHJcbiAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3VzZXJQcmluY2lwYWxOYW1lJywgVFlQRVMuTlZhckNoYXIsIHVwbilcclxuICAgICAgICAgICAgLnBhcmFtZXRlcigndW50YXBwZFVzZXJOYW1lJywgVFlQRVMuTlZhckNoYXIsIHVzZXJEZXRhaWxzLlVudGFwcGRVc2VyTmFtZSlcclxuICAgICAgICAgICAgLnBhcmFtZXRlcigndW50YXBwZEFjY2Vzc1Rva2VuJywgVFlQRVMuTlZhckNoYXIsIHVzZXJEZXRhaWxzLlVudGFwcGRBY2Nlc3NUb2tlbilcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignY2hlY2tpbkZhY2Vib29rJywgVFlQRVMuQml0LCB1c2VyRGV0YWlscy5DaGVja2luRmFjZWJvb2spXHJcbiAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ2NoZWNraW5Ud2l0dGVyJywgVFlQRVMuQml0LCB1c2VyRGV0YWlscy5DaGVja2luVHdpdHRlcilcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignY2hlY2tpbkZvdXJzcXVhcmUnLCBUWVBFUy5CaXQsIHVzZXJEZXRhaWxzLkNoZWNraW5Gb3Vyc3F1YXJlKVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCd0aHVtYm5haWxJbWFnZVVyaScsIFRZUEVTLk5WYXJDaGFyLCB1c2VyRGV0YWlscy5UaHVtYm5haWxJbWFnZVVyaSlcclxuICAgICAgICAgICAgLmV4ZWN1dGVJbW1lZGlhdGUoKTtcclxuICAgICAgICBnZXRVc2VyRGV0YWlscyh1cG4sIGZhbHNlLCB1cG4sIG91dHB1dCk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byB1cGRhdGUgdXNlci4gRGV0YWlsczogJyArIGV4KTtcclxuICAgICAgICBvdXRwdXQoe2NvZGU6IDUwMCwgbXNnOiAnRmFpbGVkIHRvIHVwZGF0ZSB1c2VyLiBEZXRhaWxzOiAnICsgZXh9KTtcclxuICAgIH1cclxufSJdfQ==
