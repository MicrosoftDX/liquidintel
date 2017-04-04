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
function getUserVotes_Internal(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT v.Id as VoteId, v.PersonnelNumber, v.VoteDate, v.UntappdId, v.BeerName, v.Brewery " +
                "FROM dbo.UserVotes v " +
                "WHERE v.PersonnelNumber = @userId AND " +
                "   v.IsCurrent = 1";
            let results = yield tds.default.sql(sqlStatement)
                .parameter('userId', tedious_1.TYPES.Int, userId)
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
    });
}
function getUserVotes(userId, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            output({ code: 200, msg: yield getUserVotes_Internal(userId) });
        }
        catch (ex) {
            return output({ code: 500, msg: ex });
        }
    });
}
exports.getUserVotes = getUserVotes;
function putUserVotes(userId, votes, output) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!votes) {
            return output({ code: 400, msg: `Bad request. The request does not include body content describing vote information.` });
        }
        new tds.TdsConnection().transaction((connection) => __awaiter(this, void 0, void 0, function* () {
            return yield votes.mapAsync((vote) => __awaiter(this, void 0, void 0, function* () {
                if (vote.VoteId) {
                    if (!vote.UntappdId) {
                        var sqlStatement = 'DELETE FROM dbo.UserVotes WHERE Id = @voteId';
                        yield connection.sql(sqlStatement)
                            .parameter('voteId', tedious_1.TYPES.Int, vote.VoteId)
                            .execute(false);
                        return {
                            VoteId: 0,
                        };
                    }
                    else {
                        var sqlStatement = "SELECT v.Id as VoteId, v.PersonnelNumber, v.IsCurrent " +
                            "FROM dbo.UserVotes v " +
                            "WHERE v.Id = @voteId";
                        let results = yield tds.default.sql(sqlStatement)
                            .parameter('voteId', tedious_1.TYPES.Int, vote.VoteId)
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
                        yield tds.default.sql(sqlStatement)
                            .parameter('voteDate', tedious_1.TYPES.DateTime2, new Date())
                            .parameter('untappdId', tedious_1.TYPES.Int, vote.UntappdId)
                            .parameter('beerName', tedious_1.TYPES.NVarChar, vote.BeerName)
                            .parameter('brewery', tedious_1.TYPES.NVarChar, vote.Brewery)
                            .parameter('voteId', tedious_1.TYPES.Int, vote.VoteId)
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
                    let currentVotes = yield getUserVotes_Internal(userId);
                    if (currentVotes.length >= 2) {
                        throw `Bad request. The specified user: ${userId} already has 2 active votes. Creation of new votes is not permitted until 1 or more of the votes lapses. Existing votes may be updated.`;
                    }
                    var sqlStatement = "INSERT INTO dbo.UserVotes (PersonnelNumber, VoteDate, UntappdId, BeerName, Brewery, IsCurrent) " +
                        "VALUES (@userId, @voteDate, @untappdId, @beerName, @brewery, 1); " +
                        "SELECT v.Id as VoteId, v.PersonnelNumber, v.VoteDate, v.UntappdId, v.BeerName, v.Brewery " +
                        "FROM dbo.UserVotes v " +
                        "WHERE v.Id = SCOPE_IDENTITY();";
                    let insertedVotes = yield tds.default.sql(sqlStatement)
                        .parameter('userId', tedious_1.TYPES.Int, userId)
                        .parameter('voteDate', tedious_1.TYPES.DateTime2, new Date())
                        .parameter('untappdId', tedious_1.TYPES.Int, vote.UntappdId)
                        .parameter('beerName', tedious_1.TYPES.NVarChar, vote.BeerName)
                        .parameter('brewery', tedious_1.TYPES.NVarChar, vote.Brewery)
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
            }));
        }), (votes) => {
            output({ code: 201, msg: votes.filter(vote => vote.VoteId != 0) });
        }, (ex) => {
            console.warn(`Failed to upsert vote for user: ${userId}. Details: ` + ex.stack);
            return output({ code: 500, msg: 'Internal Error: ' + ex });
        });
    });
}
exports.putUserVotes = putUserVotes;
function getVotesTally(output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var sqlStatement = "SELECT v.UntappdId, v.BeerName, v.Brewery, COUNT(*) VoteCount " +
                "FROM dbo.UserVotes v " +
                "WHERE v.IsCurrent = 1 " +
                "GROUP BY v.UntappdId, v.BeerName, v.Brewery " +
                "ORDER BY COUNT(*) DESC";
            let results = yield tds.default.sql(sqlStatement)
                .executeImmediate();
            return output({ code: 200, msg: results.map(row => {
                    return {
                        UntappdId: row.UntappdId,
                        BeerName: row.BeerName,
                        Brewery: row.Brewery,
                        VoteCount: row.VoteCount
                    };
                }) });
        }
        catch (ex) {
            console.warn(`Failed to retrieve votes tally. Details: ` + ex.stack);
            return Promise.reject('Internal error: ' + ex);
        }
    });
}
exports.getVotesTally = getVotesTally;
//# sourceMappingURL=votingController.js.map