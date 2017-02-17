
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';
import aad = require('../../ad')

var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(process.env.AuthorizedGroups.split(';'), token);

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
                'PersonnelNumber': results[0].PersonnelNumber,
                'Valid': validUser,
                'FullName': results[0].FullName
            }});
        }
    }
    catch (ex) {
        return output({code: 500, msg:'Internal Error: ' + ex});
    }
}
