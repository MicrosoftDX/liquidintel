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
            return output({ code: 500, msg: 'Internal error: ' + ex });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9jb250cm9sbGVycy9wZXJzb25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSw2Q0FBOEM7QUFDOUMscUNBQThCO0FBQzlCLG1DQUFvQztBQUNwQyxzREFBdUQ7QUFFdkQsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUYsSUFBSSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVySCwyQkFBd0MsTUFBYyxFQUFFLE1BQXNDOztRQUMxRixJQUFJLENBQUM7WUFDRCxJQUFJLFlBQVksR0FDWiwwREFBMEQ7Z0JBQzFELDRHQUE0RztnQkFDNUcsK0JBQStCLENBQUM7WUFDcEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7aUJBQzVDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsZUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7aUJBQ3ZDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUMsaUNBQWlDLEdBQUcsTUFBTSxFQUFDLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBRUYsSUFBSSxTQUFTLEdBQUcsTUFBTSxlQUFlLENBQUMs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RUFBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQTlDRCwwQ0E4Q0MiLCJmaWxlIjoiYXBwL2NvbnRyb2xsZXJzL3BlcnNvbkNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XHJcbmltcG9ydCB0ZHMgPSByZXF1aXJlKCcuLi91dGlscy90ZHMtcHJvbWlzZXMnKTtcclxuaW1wb3J0IHtUWVBFU30gZnJvbSAndGVkaW91cyc7XHJcbmltcG9ydCBhYWQgPSByZXF1aXJlKCcuLi91dGlscy9hZCcpO1xyXG5pbXBvcnQgc2V0dGluZ3MgPSByZXF1aXJlKCcuLi91dGlscy9zZXR0aW5nc19lbmNvZGVyJyk7XHJcblxyXG52YXIgdG9rZW4gPSBuZXcgYWFkLlRva2VuKHByb2Nlc3MuZW52LlRlbmFudCwgcHJvY2Vzcy5lbnYuQ2xpZW50SWQsIHByb2Nlc3MuZW52LkNsaWVudFNlY3JldCk7XHJcbnZhciBncm91cE1lbWJlcnNoaXAgPSBuZXcgYWFkLkdyYXBoR3JvdXBNZW1iZXJzaGlwKHNldHRpbmdzLmRlY29kZVNldHRpbmdBcnJheShwcm9jZXNzLmVudi5BdXRob3JpemVkR3JvdXBzKSwgdG9rZW4pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcnNvbkJ5Q2FyZElkKGNhcmRJZDogbnVtYmVyLCBvdXRwdXQ6IChyZXNwOmFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXHJcbiAgICAgICAgICAgIFwiU0VMRUNUIHAuW1BlcnNvbm5lbE51bWJlcl0sIHAuW0VtYWlsTmFtZV0sIHAuW0Z1bGxOYW1lXSBcIiArXHJcbiAgICAgICAgICAgIFwiRlJPTSBkYm8uW0NBUkQwMkNhcmRLZXlNYXBwaW5nU10gYyBJTk5FUiBKT0lOIGRiby5bSEMwMVBlcnNvbl0gcCBPTiBjLlNBUFBlcnNvbm5lbE5iciA9IHAuUGVyc29ubmVsTnVtYmVyIFwiICtcclxuICAgICAgICAgICAgXCJXSEVSRSBjLkNhcmRLZXlOYnIgPSBAY2FyZF9pZFwiO1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignY2FyZF9pZCcsIFRZUEVTLkludCwgY2FyZElkKVxyXG4gICAgICAgICAgICAuZXhlY3V0ZUltbWVkaWF0ZSgpO1xyXG4gICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCAhPSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQoe2NvZGU6IDQwNCwgbXNnOlwiTm8gcGVyc29uIGZvdW5kIGhhdmluZyBDYXJkSWQ6IFwiICsgY2FyZElkfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBQZXJmb3JtIGFuIEFBRCBsb29rdXAgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgdXNlciBpcyBhIHRyYW5zaXRpdmUgbWVtYmVyIG9mIGFueSBvZiBvdXIgY29uZmlndXJlZCBncm91cHNcclxuICAgICAgICAgICAgbGV0IHZhbGlkVXNlciA9IGF3YWl0IGdyb3VwTWVtYmVyc2hpcC5pc1VzZXJNZW1iZXIoYCR7cmVzdWx0c1swXS5FbWFpbE5hbWV9QCR7cHJvY2Vzcy5lbnYuVGVuYW50fWApO1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IDIwMCwgbXNnOiB7XHJcbiAgICAgICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IHJlc3VsdHNbMF0uUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgVmFsaWQ6IHZhbGlkVXNlcixcclxuICAgICAgICAgICAgICAgIEZ1bGxOYW1lOiByZXN1bHRzWzBdLkZ1bGxOYW1lXHJcbiAgICAgICAgICAgIH19KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOiA1MDAsIG1zZzonSW50ZXJuYWwgRXJyb3I6ICcgKyBleH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmFsaWRQZW9wbGUoY2FyZElkOiBudW1iZXIsIG91dHB1dDogKHJlc3A6YW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBncm91cE1lbWJlcnMgPSBhd2FpdCBncm91cE1lbWJlcnNoaXAuZ2V0TWVtYmVycygpO1xyXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZ28gdG8gdGhlIGRhdGFiYXNlIHRvIGdldCB0aGUgY2FyZCAjLiBXZSB1c2UgYSB0YWJsZS12YWx1ZWQgcGFyYW1ldGVyIHRvIGxpbWl0IHRoZSBlbWFpbCBhZGRyZXNzZXNcclxuICAgICAgICAvLyAmIGEgc3Byb2MgYmVjYXVzZSB0ZWRpb3VzIGNhbiBvbmx5IGJpbmQgVFZQcyB0byBzcHJvYyBpbnZvY2F0aW9ucy5cclxuICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXCJkYm8uR2V0VmFsaWRQZW9wbGVcIjtcclxuICAgICAgICB2YXIgdHZwID0ge1xyXG4gICAgICAgICAgICBuYW1lOiAnRW1haWxBbGlhc2VzJyxcclxuICAgICAgICAgICAgY29sdW1uczogW3tcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdFbWFpbEFsaWFzJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFRZUEVTLlZhckNoYXJcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHJvd3M6IGdyb3VwTWVtYmVycy5tYXAobWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbbWVtYmVyLnVzZXJQcmluY2lwYWxOYW1lLnNwbGl0KCdAJylbMF1dO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBhd2FpdCB0ZHMuZGVmYXVsdC5zcWwoc3FsU3RhdGVtZW50KVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdhbGlhc2VzJywgVFlQRVMuVFZQLCB0dnApXHJcbiAgICAgICAgICAgIC5leGVjdXRlKHRydWUsIHRydWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOjIwMCwgbXNnOiByZXN1bHRzLm1hcChtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgUGVyc29ubmVsTnVtYmVyOiBtZW1iZXIuUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBGdWxsTmFtZTogbWVtYmVyLkZ1bGxOYW1lLFxyXG4gICAgICAgICAgICAgICAgQ2FyZElkOiBtZW1iZXIuQ2FyZEtleU5iclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSl9KTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIHJldHJpZXZlIGxpc3Qgb2YgdmFsaWQgcGVvcGxlLiBEZXRhaWxzOiAnICsgZXgpO1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQoe2NvZGU6IDUwMCwgbXNnOiAnSW50ZXJuYWwgZXJyb3I6ICcgKyBleH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckRldGFpbHModXBuOiBzdHJpbmcsIGlzQWRtaW46IGJvb2xlYW4sIHRva2VuVXBuOiBzdHJpbmcsIG91dHB1dDogKHJlc3A6IGFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSwgc3VjY2Vzc1Jlc3BvbnNlOiBudW1iZXIgPSAyMDApIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKHVwbiAmJiB1cG4udG9Mb3dlckNhc2UoKSA9PT0gJ21lJykge1xyXG4gICAgICAgICAgICB1cG4gPSB0b2tlblVwbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIWlzQWRtaW4pIHtcclxuICAgICAgICAgICAgLy8gTm9uLWFkbWluIHVzZXJzIGNhbiBvbmx5IGFzayBmb3IgdGhlaXIgb3duIGluZm9cclxuICAgICAgICAgICAgaWYgKHVwbiAmJiB1cG4udG9Mb3dlckNhc2UoKSAhPT0gdG9rZW5VcG4udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dCh7Y29kZTogNDAwLCBtc2c6ICdDYWxsZXIgY2FuIG9ubHkgcmVxdWVzdCBvd24gdXNlciBpbmZvcm1hdGlvbi4nfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXBuID0gdXBuIHx8IHRva2VuVXBuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBOb3RlIHRoYXQgaWYgYW4gYWRtaW4gaXMgYXNraW5nIGZvciBldmVyeW9uZSwgd2UgZG9uJ3QgYXVnbWVudCBjb3JyZWN0bHkgd2l0aCB0aGUgSXNBZG1pbiBmbGFnLiBUaGlzIGlzIHRvIGF2b2lkIHRoZSBsYXRlbmN5XHJcbiAgICAgICAgLy8gb3ZlcmhlYWQgb2YgbG9va3VwIHVwIGV2ZXJ5b25lIGFnYWluc3QgQUFELlxyXG4gICAgICAgIHZhciBzcWxTdGF0ZW1lbnQgPSBcIlNFTEVDVCB1LlBlcnNvbm5lbE51bWJlciwgdS5Vc2VyUHJpbmNpcGFsTmFtZSwgdS5VbnRhcHBkVXNlck5hbWUsIHUuVW50YXBwZEFjY2Vzc1Rva2VuLCB1LkNoZWNraW5GYWNlYm9vaywgdS5DaGVja2luVHdpdHRlciwgdS5DaGVja2luRm91cnNxdWFyZSwgdS5UaHVtYm5haWxJbWFnZVVyaSwgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgcC5GdWxsTmFtZSwgcC5GaXJzdE5hbWUsIHAuTGFzdE5hbWUsIEBpc0FkbWluIEFTIElzQWRtaW4gXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZST00gZGJvLlVzZXJzIHUgSU5ORVIgSk9JTiBIQzAxUGVyc29uIHAgT04gdS5QZXJzb25uZWxOdW1iZXIgPSBwLlBlcnNvbm5lbE51bWJlciBcIjtcclxuICAgICAgICBpZiAodXBuKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNxbFN0YXRlbWVudCArPSBcIldIRVJFIHUuVXNlclByaW5jaXBhbE5hbWUgPSBAdXBuIFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzcWxTdGF0ZW1lbnQgKz0gXCJPUkRFUiBCWSBwLkZ1bGxOYW1lXCI7XHJcbiAgICAgICAgdmFyIHN0bXQgPSB0ZHMuZGVmYXVsdC5zcWwoc3FsU3RhdGVtZW50KVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdpc0FkbWluJywgVFlQRVMuQml0LCBpc0FkbWluKTtcclxuICAgICAgICBpZiAodXBuKSB7XHJcbiAgICAgICAgICAgIHN0bXQucGFyYW1ldGVyKCd1cG4nLCBUWVBFUy5OVmFyQ2hhciwgdXBuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHVzZXJzID0gYXdhaXQgc3RtdC5leGVjdXRlSW1tZWRpYXRlKCk7XHJcbiAgICAgICAgaWYgKHVwbiAmJiB1c2Vycy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAvLyBUcnkgZGlyZWN0bHkgYWdhaW5zdCB0aGUgSEMwMVBlcnNvbiB0YWJsZVxyXG4gICAgICAgICAgICBzcWxTdGF0ZW1lbnQgPSBcIlNFTEVDVCBQZXJzb25uZWxOdW1iZXIsIEVtYWlsTmFtZSwgTlVMTCBhcyBVbnRhcHBkVXNlck5hbWUsIE5VTEwgYXMgVW50YXBwZEFjY2Vzc1Rva2VuLCAwIGFzIENoZWNraW5GYWNlYm9vaywgMCBhcyBDaGVja2luVHdpdHRlciwgMCBhcyBDaGVja2luRm91cnNxdWFyZSwgTlVMTCBhcyBUaHVtYm5haWxJbWFnZVVyaSwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBGdWxsTmFtZSwgRmlyc3ROYW1lLCBMYXN0TmFtZSwgQGlzQWRtaW4gYXMgSXNBZG1pbiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRlJPTSBkYm8uSEMwMVBlcnNvbiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV0hFUkUgRW1haWxOYW1lID0gQGFsaWFzXCI7XHJcbiAgICAgICAgICAgIHZhciB1c2VyID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ2lzQWRtaW4nLCBUWVBFUy5CaXQsIGlzQWRtaW4pXHJcbiAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCdhbGlhcycsIFRZUEVTLlZhckNoYXIsIHVwbi5zcGxpdCgnQCcpWzBdKVxyXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVJbW1lZGlhdGUoKTtcclxuICAgICAgICAgICAgaWYgKHVzZXIubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dCh7Y29kZTogc3VjY2Vzc1Jlc3BvbnNlLCBtc2c6IHVzZXJbMF19KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IDQwNCwgbXNnOiAnVXNlciBkb2VzIG5vdCBleGlzdCd9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIXVwbikge1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IHN1Y2Nlc3NSZXNwb25zZSwgbXNnOiB1c2Vyc30pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgb3V0cHV0KHtjb2RlOiBzdWNjZXNzUmVzcG9uc2UsIG1zZzogdXNlcnNbMF19KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byByZXRyaWV2ZSB1c2VyLiBEZXRhaWxzOiAnICsgZXgpO1xyXG4gICAgICAgIG91dHB1dCh7Y29kZTo1MDAsIG1zZzogJ0ZhaWxlZCB0byByZXRyaWV2ZSB1c2VyLiBEZXRhaWxzOiAnICsgZXh9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3RVc2VyRGV0YWlscyh1cG46IHN0cmluZywgaXNBZG1pbjogYm9vbGVhbiwgdG9rZW5VcG46IHN0cmluZywgdXNlckRldGFpbHMsIG91dHB1dDogKHJlc3A6IGFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAodXBuICYmIHVwbi50b0xvd2VyQ2FzZSgpID09PSAnbWUnKSB7XHJcbiAgICAgICAgICAgIHVwbiA9IHRva2VuVXBuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaXNBZG1pbikge1xyXG4gICAgICAgICAgICAvLyBOb24tYWRtaW4gdXNlcnMgY2FuIG9ubHkgYXNrIGZvciB0aGVpciBvd24gaW5mb1xyXG4gICAgICAgICAgICBpZiAodXBuICYmIHVwbi50b0xvd2VyQ2FzZSgpICE9PSB0b2tlblVwbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0KHtjb2RlOiA0MDAsIG1zZzogJ0NhbGxlciBjYW4gb25seSB1cGRhdGUgb3duIHVzZXIgaW5mb3JtYXRpb24uJ30pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVwbiA9IHVwbiB8fCB0b2tlblVwbjtcclxuICAgICAgICBpZiAodXNlckRldGFpbHMuVXNlclByaW5jaXBhbE5hbWUgJiYgdXBuLnRvTG93ZXJDYXNlKCkgIT09IHVzZXJEZXRhaWxzLlVzZXJQcmluY2lwYWxOYW1lLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dCh7Y29kZTogNDAwLCBtc2c6ICdVc2VyUHJpbmNpcGFsTmFtZSBpbiBwYXlsb2FkIE1VU1QgbWF0Y2ggcmVzb3VyY2UgbmFtZSd9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNxbFN0YXRlbWVudCA9IFwiTUVSR0UgZGJvLlVzZXJzIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJVU0lORyAoXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBWQUxVRVMoQHBlcnNvbm5lbE51bWJlciwgQHVzZXJQcmluY2lwYWxOYW1lLCBAdW50YXBwZFVzZXJOYW1lLCBAdW50YXBwZEFjY2Vzc1Rva2VuLCBAY2hlY2tpbkZhY2Vib29rLCBAY2hlY2tpblR3aXR0ZXIsIEBjaGVja2luRm91cnNxdWFyZSwgQHRodW1ibmFpbEltYWdlVXJpKVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIpIEFTIHNvdXJjZShQZXJzb25uZWxOdW1iZXIsIFVzZXJQcmluY2lwYWxOYW1lLCBVbnRhcHBkVXNlck5hbWUsIFVudGFwcGRBY2Nlc3NUb2tlbiwgQ2hlY2tpbkZhY2Vib29rLCBDaGVja2luVHdpdHRlciwgQ2hlY2tpbkZvdXJzcXVhcmUsIFRodW1ibmFpbEltYWdlVXJpKSBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiT04gVXNlcnMuUGVyc29ubmVsTnVtYmVyID0gc291cmNlLlBlcnNvbm5lbE51bWJlciBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV0hFTiBNQVRDSEVEIFRIRU4gXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBVUERBVEUgU0VUIFVudGFwcGRVc2VyTmFtZSA9IHNvdXJjZS5VbnRhcHBkVXNlck5hbWUsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgICAgIFVudGFwcGRBY2Nlc3NUb2tlbiA9IHNvdXJjZS5VbnRhcHBkQWNjZXNzVG9rZW4sIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgICAgIENoZWNraW5GYWNlYm9vayA9IHNvdXJjZS5DaGVja2luRmFjZWJvb2ssIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICAgICAgIENoZWNraW5Ud2l0dGVyID0gc291cmNlLkNoZWNraW5Ud2l0dGVyLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgICAgICBDaGVja2luRm91cnNxdWFyZSA9IHNvdXJjZS5DaGVja2luRm91cnNxdWFyZSwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICAgICAgVGh1bWJuYWlsSW1hZ2VVcmkgPSBzb3VyY2UuVGh1bWJuYWlsSW1hZ2VVcmkgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIldIRU4gTk9UIE1BVENIRUQgVEhFTiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgIElOU0VSVCAoUGVyc29ubmVsTnVtYmVyLCBVc2VyUHJpbmNpcGFsTmFtZSwgVW50YXBwZFVzZXJOYW1lLCBVbnRhcHBkQWNjZXNzVG9rZW4sIENoZWNraW5GYWNlYm9vaywgQ2hlY2tpblR3aXR0ZXIsIENoZWNraW5Gb3Vyc3F1YXJlLCBUaHVtYm5haWxJbWFnZVVyaSkgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgICBWQUxVRVMgKHNvdXJjZS5QZXJzb25uZWxOdW1iZXIsIHNvdXJjZS5Vc2VyUHJpbmNpcGFsTmFtZSwgc291cmNlLlVudGFwcGRVc2VyTmFtZSwgc291cmNlLlVudGFwcGRBY2Nlc3NUb2tlbiwgc291cmNlLkNoZWNraW5GYWNlYm9vaywgc291cmNlLkNoZWNraW5Ud2l0dGVyLCBzb3VyY2UuQ2hlY2tpbkZvdXJzcXVhcmUsIHNvdXJjZS5UaHVtYm5haWxJbWFnZVVyaSk7XCI7XHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCB0ZHMuZGVmYXVsdC5zcWwoc3FsU3RhdGVtZW50KVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdwZXJzb25uZWxOdW1iZXInLCBUWVBFUy5JbnQsIHVzZXJEZXRhaWxzLlBlcnNvbm5lbE51bWJlcilcclxuICAgICAgICAgICAgLnBhcmFtZXRlcigndXNlclByaW5jaXBhbE5hbWUnLCBUWVBFUy5OVmFyQ2hhciwgdXBuKVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCd1bnRhcHBkVXNlck5hbWUnLCBUWVBFUy5OVmFyQ2hhciwgdXNlckRldGFpbHMuVW50YXBwZFVzZXJOYW1lKVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCd1bnRhcHBkQWNjZXNzVG9rZW4nLCBUWVBFUy5OVmFyQ2hhciwgdXNlckRldGFpbHMuVW50YXBwZEFjY2Vzc1Rva2VuKVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdjaGVja2luRmFjZWJvb2snLCBUWVBFUy5CaXQsIHVzZXJEZXRhaWxzLkNoZWNraW5GYWNlYm9vaylcclxuICAgICAgICAgICAgLnBhcmFtZXRlcignY2hlY2tpblR3aXR0ZXInLCBUWVBFUy5CaXQsIHVzZXJEZXRhaWxzLkNoZWNraW5Ud2l0dGVyKVxyXG4gICAgICAgICAgICAucGFyYW1ldGVyKCdjaGVja2luRm91cnNxdWFyZScsIFRZUEVTLkJpdCwgdXNlckRldGFpbHMuQ2hlY2tpbkZvdXJzcXVhcmUpXHJcbiAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3RodW1ibmFpbEltYWdlVXJpJywgVFlQRVMuTlZhckNoYXIsIHVzZXJEZXRhaWxzLlRodW1ibmFpbEltYWdlVXJpKVxyXG4gICAgICAgICAgICAuZXhlY3V0ZUltbWVkaWF0ZSgpO1xyXG4gICAgICAgIGdldFVzZXJEZXRhaWxzKHVwbiwgZmFsc2UsIHVwbiwgb3V0cHV0LCAyMDEpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gdXBkYXRlIHVzZXIuIERldGFpbHM6ICcgKyBleCk7XHJcbiAgICAgICAgb3V0cHV0KHtjb2RlOiA1MDAsIG1zZzogJ0ZhaWxlZCB0byB1cGRhdGUgdXNlci4gRGV0YWlsczogJyArIGV4fSk7XHJcbiAgICB9XHJcbn0iXX0=
