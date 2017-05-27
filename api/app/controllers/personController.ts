
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import aad = require('../utils/ad');
import settings = require('../utils/settings_encoder');

var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(settings.decodeSettingArray(process.env.AuthorizedGroups), token);

export async function getPersonByCardId(cardId: number, output: (resp:any) => express.Response) {
    try {
        var sqlStatement = 
            "SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName] " +
            "FROM dbo.[CARD02CardKeyMappingS] c INNER JOIN dbo.[HC01Person] p ON c.SAPPersonnelNbr = p.PersonnelNumber " +
            "WHERE c.CardKeyNbr = @card_id";
        let results = await tds.default.sql(sqlStatement)
            .parameter('card_id', TYPES.Int, cardId)
            .executeImmediate();
        if (!results || results.length != 1) {
            return output({code: 404, msg:"No person found having CardId: " + cardId});
        }
        else {
            // Perform an AAD lookup to determine if this user is a transitive member of any of our configured groups
            let validUser = await groupMembership.isUserMember(`${results[0].EmailName}@${process.env.Tenant}`);
            output({code: 200, msg: {
                PersonnelNumber: results[0].PersonnelNumber,
                Valid: validUser,
                FullName: results[0].FullName
            }});
        }
    }
    catch (ex) {
        return output({code: 500, msg:'Internal Error: ' + ex});
    }
}

export async function getValidPeople(cardId: number, output: (resp:any) => express.Response) {
    try {
        let groupMembers = await groupMembership.getMembers();
        // We need to go to the database to get the card #. We use a table-valued parameter to limit the email addresses
        // & a sproc because tedious can only bind TVPs to sproc invocations.
        var sqlStatement = "dbo.GetValidPeople";
        var tvp = {
            name: 'EmailAliases',
            columns: [{
                name: 'EmailAlias',
                type: TYPES.VarChar
            }],
            rows: groupMembers.map(member => {
                return [member.userPrincipalName.split('@')[0]];
            })
        };
        let results = await tds.default.sql(sqlStatement)
            .parameter('aliases', TYPES.TVP, tvp)
            .execute(true, true);

        return output({code:200, msg: results.map(member => {
            return {
                PersonnelNumber: member.PersonnelNumber,
                Valid: true,
                FullName: member.FullName,
                CardId: member.CardKeyNbr
            }
        })});
    }
    catch (ex) {
        console.warn('Failed to retrieve list of valid people. Details: ' + ex);
        return output({code: 500, msg: 'Internal error: ' + ex.stack});
    }
}

export async function getUserDetails(upn: string, isAdmin: boolean, tokenUpn: string, output: (resp: any) => express.Response, successResponse: number = 200) {
    try {
        if (upn && upn.toLowerCase() === 'me') {
            upn = tokenUpn;
        }
        else if (!isAdmin) {
            // Non-admin users can only ask for their own info
            if (upn && upn.toLowerCase() !== tokenUpn.toLowerCase()) {
                return output({code: 400, msg: 'Caller can only request own user information.'});
            }
            upn = upn || tokenUpn;
        }
        // Note that if an admin is asking for everyone, we don't augment correctly with the IsAdmin flag. This is to avoid the latency
        // overhead of lookup up everyone against AAD.
        var sqlStatement = "SELECT u.PersonnelNumber, u.UserPrincipalName, u.UntappdUserName, u.UntappdAccessToken, u.CheckinFacebook, u.CheckinTwitter, u.CheckinFoursquare, u.ThumbnailImageUri, " + 
                           "    p.FullName, p.FirstName, p.LastName, @isAdmin AS IsAdmin " +
                           "FROM dbo.Users u INNER JOIN HC01Person p ON u.PersonnelNumber = p.PersonnelNumber ";
        if (upn) {                           
            sqlStatement += "WHERE u.UserPrincipalName = @upn ";
        }
        sqlStatement += "ORDER BY p.FullName";
        var stmt = tds.default.sql(sqlStatement)
            .parameter('isAdmin', TYPES.Bit, isAdmin);
        if (upn) {
            stmt.parameter('upn', TYPES.NVarChar, upn);
        }
        var users = await stmt.executeImmediate();
        if (upn && users.length == 0) {
            // Try directly against the HC01Person table
            sqlStatement = "SELECT PersonnelNumber, EmailName, NULL as UntappdUserName, NULL as UntappdAccessToken, 0 as CheckinFacebook, 0 as CheckinTwitter, 0 as CheckinFoursquare, NULL as ThumbnailImageUri, " +
                           "    FullName, FirstName, LastName, @isAdmin as IsAdmin " +
                           "FROM dbo.HC01Person " +
                           "WHERE EmailName = @alias";
            var user = await tds.default.sql(sqlStatement)
                .parameter('isAdmin', TYPES.Bit, isAdmin)
                .parameter('alias', TYPES.VarChar, upn.split('@')[0])
                .executeImmediate();
            if (user.length == 1) {
                output({code: successResponse, msg: user[0]});
            }
            output({code: 404, msg: 'User does not exist'});
        }
        else if (!upn) {
            output({code: successResponse, msg: users});
        }
        else {
            output({code: successResponse, msg: users[0]});
        }
    }
    catch (ex) {
        console.warn('Failed to retrieve user. Details: ' + ex);
        output({code:500, msg: 'Failed to retrieve user. Details: ' + ex});
    }
}

export async function postUserDetails(upn: string, isAdmin: boolean, tokenUpn: string, userDetails, output: (resp: any) => express.Response) {
    try {
        if (upn && upn.toLowerCase() === 'me') {
            upn = tokenUpn;
        }
        else if (!isAdmin) {
            // Non-admin users can only ask for their own info
            if (upn && upn.toLowerCase() !== tokenUpn.toLowerCase()) {
                return output({code: 400, msg: 'Caller can only update own user information.'});
            }
        }
        upn = upn || tokenUpn;
        if (userDetails.UserPrincipalName && upn.toLowerCase() !== userDetails.UserPrincipalName.toLowerCase()) {
            return output({code: 400, msg: 'UserPrincipalName in payload MUST match resource name'});
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
        var results = await tds.default.sql(sqlStatement)
            .parameter('personnelNumber', TYPES.Int, userDetails.PersonnelNumber)
            .parameter('userPrincipalName', TYPES.NVarChar, upn)
            .parameter('untappdUserName', TYPES.NVarChar, userDetails.UntappdUserName)
            .parameter('untappdAccessToken', TYPES.NVarChar, userDetails.UntappdAccessToken)
            .parameter('checkinFacebook', TYPES.Bit, userDetails.CheckinFacebook)
            .parameter('checkinTwitter', TYPES.Bit, userDetails.CheckinTwitter)
            .parameter('checkinFoursquare', TYPES.Bit, userDetails.CheckinFoursquare)
            .parameter('thumbnailImageUri', TYPES.NVarChar, userDetails.ThumbnailImageUri)
            .executeImmediate();
        getUserDetails(upn, false, upn, output, 201);
    }
    catch (ex) {
        console.warn('Failed to update user. Details: ' + ex);
        output({code: 500, msg: 'Failed to update user. Details: ' + ex});
    }
}