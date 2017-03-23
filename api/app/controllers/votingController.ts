
import express = require('express');
import tds = require('../utils/tds-promises');
import {TYPES} from 'tedious';

async function getUserVotes_Internal(userId: number): Promise<any[]> {
    try {
        var sqlStatement = "SELECT v.Id as VoteId, v.PersonnelNumber, v.VoteDate, v.UntappdId, v.BeerName, v.Brewery " + 
                        "FROM dbo.UserVotes v " +
                        "WHERE v.PersonnelNumber = @userId AND " +
                        "   v.IsCurrent = 1";
        let results = await tds.default.sql(sqlStatement)
            .parameter('userId', TYPES.Int, userId)
            .executeImmediate();
        return results.map(row => {
            return {
                VoteId: row.VoteId,
                PersonnelNumber: row.PersonnelNumber,
                VoteDate: row.VoteDate,
                UntappdId: row.UntappdId,
                BeerName: row.BeerName,
                Brewery: row.Brewery
            };
        });
    }
    catch (ex) {
        console.warn(`Failed to retrieve valid votes for user: ${userId}. Details: ` + ex.stack);
        return Promise.reject('Internal error: ' + ex);
    }
}

export async function getUserVotes(userId: number, output: (resp:any) => express.Response) {
    try {
        output({ code: 200, msg: await getUserVotes_Internal(userId) });
    }
    catch (ex) {
        return output({ code: 500, msg: ex });
    }
}

export async function putUserVotes(userId: number, votes: any[], output: (resp:any) => express.Response) {
    // Do some object validation
    if (!votes) {
        return output({ code: 400, msg: `Bad request. The request does not include body content describing vote information.`});
    }
    new tds.TdsConnection().transaction(async (connection: tds.TdsConnection) => {
        return await votes.mapAsync(async vote => {
            // Work out if this is an INSERT or an UPDATE/DELETE
            if (vote.VoteId) {
                if (!vote.UntappdId) {
                    // DELETE the vote
                    var sqlStatement = 'DELETE FROM dbo.UserVotes WHERE Id = @voteId';
                    await connection.sql(sqlStatement)
                        .parameter('voteId', TYPES.Int, vote.VoteId)
                        .execute(false);
                    return {
                        VoteId: 0,
                    };
                }
                else {
                    // Existing vote - update the details. Check first that this vote exists & is current.
                    var sqlStatement = "SELECT v.Id as VoteId, v.PersonnelNumber, v.IsCurrent " + 
                                    "FROM dbo.UserVotes v " +
                                    "WHERE v.Id = @voteId";
                    let results = await tds.default.sql(sqlStatement)
                        .parameter('voteId', TYPES.Int, vote.VoteId)
                        .executeImmediate();
                    if (results.length == 0) {
                        throw `Specified vote id: ${vote.VoteId} does not exist`;
                    }
                    else if (!results[0].IsCurrent) {
                        throw `Bad request. The specified vote: ${vote.VoteId} is no longer current. This vote cannot be updated.`;
                    }
                    else if (results[0].PersonnelNumber != userId) {
                        throw `Bad request. The specified vote: ${vote.VoteId} is not associated with the specified user: ${userId}.`;
                    }
                    sqlStatement = "UPDATE dbo.UserVotes " + 
                                    "SET VoteDate = @voteDate, " + 
                                    "   UntappdId = @untappdId, " + 
                                    "   BeerName = @beerName, " + 
                                    "   Brewery = @brewery " + 
                                    "WHERE Id = @voteId";
                    await tds.default.sql(sqlStatement)
                        .parameter('voteDate', TYPES.DateTime2, new Date())
                        .parameter('untappdId', TYPES.Int, vote.UntappdId)
                        .parameter('beerName', TYPES.NVarChar, vote.BeerName)
                        .parameter('brewery', TYPES.NVarChar, vote.Brewery)
                        .parameter('voteId', TYPES.Int, vote.VoteId)
                        .execute(false);
                    return {
                        VoteId: vote.VoteId,
                        PersonnelNumber: userId,
                        VoteDate: new Date(),
                        UntappdId: vote.UntappdId,
                        BeerName: vote.BeerName,
                        Brewery: vote.Brewery
                    };
                }
            }
            else {
                // Adding a new vote. Can only do this if the user has less than 2 active votes
                let currentVotes = await getUserVotes_Internal(userId);
                if (currentVotes.length >= 2) {
                    throw `Bad request. The specified user: ${userId} already has 2 active votes. Creation of new votes is not permitted until 1 or more of the votes lapses. Existing votes may be updated.`;
                }
                var sqlStatement = "INSERT INTO dbo.UserVotes (PersonnelNumber, VoteDate, UntappdId, BeerName, Brewery, IsCurrent) " + 
                                    "VALUES (@userId, @voteDate, @untappdId, @beerName, @brewery, 1); " + 
                                    "SELECT v.Id as VoteId, v.PersonnelNumber, v.VoteDate, v.UntappdId, v.BeerName, v.Brewery " + 
                                    "FROM dbo.UserVotes v " + 
                                    "WHERE v.Id = SCOPE_IDENTITY();";
                let insertedVotes = await tds.default.sql(sqlStatement)
                    .parameter('userId', TYPES.Int, userId)
                    .parameter('voteDate', TYPES.DateTime2, new Date())
                    .parameter('untappdId', TYPES.Int, vote.UntappdId)
                    .parameter('beerName', TYPES.NVarChar, vote.BeerName)
                    .parameter('brewery', TYPES.NVarChar, vote.Brewery)
                    .execute(false);
                    
                var insertedVote = insertedVotes[0];
                return {
                    VoteId: insertedVote.VoteId,
                    PersonnelNumber: insertedVote.PersonnelNumber,
                    VoteDate: insertedVote.VoteDate,
                    UntappdId: insertedVote.UntappdId,
                    BeerName: insertedVote.BeerName,
                    Brewery: insertedVote.Brewery
                };
            }
        });
    },
    (votes: any[]) => {
        output({ code: 201, msg: votes.filter(vote => vote.VoteId != 0) });
    },
    (ex: Error) => {
        console.warn(`Failed to upsert vote for user: ${userId}. Details: ` + ex.stack);
        return output({ code: 500, msg: 'Internal Error: ' + ex });
    });
}

export async function getVotesTally(output: (resp:any) => express.Response) {
    try {
        var sqlStatement = "SELECT v.UntappdId, v.BeerName, v.Brewery, COUNT(*) VoteCount " + 
                        "FROM dbo.UserVotes v " +
                        "WHERE v.IsCurrent = 1 " + 
                        "GROUP BY v.UntappdId, v.BeerName, v.Brewery " + 
                        "ORDER BY COUNT(*) DESC"
        let results = await tds.default.sql(sqlStatement)
            .executeImmediate();
        return output({ code: 200, msg: results.map(row => {
            return {
                UntappdId: row.UntappdId,
                BeerName: row.BeerName,
                Brewery: row.Brewery,
                VoteCount: row.VoteCount
            };
        })});
    }
    catch (ex) {
        console.warn(`Failed to retrieve votes tally. Details: ` + ex.stack);
        return Promise.reject('Internal error: ' + ex);
    }
}
