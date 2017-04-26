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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9jb250cm9sbGVycy92b3RpbmdDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSw2Q0FBOEM7QUFDOUMscUNBQThCO0FBRTlCLCtCQUFxQyxNQUFjOztRQUMvQyxJQUFJLENBQUM7WUFDRCxJQUFJLFlBQVksR0FBRywyRkFBMkY7Z0JBQzlGLHVCQUF1QjtnQkFDdkIsd0NBQXdDO2dCQUN4QyxvQkFBb0IsQ0FBQztZQUNyQyxJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztpQkFDNUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxlQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztpQkFDdEMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHO2dCQUNsQixNQUFNLENBQUM7b0JBQ0gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixlQUFlLEVBQUUsR0FBRyxDQUFDLGVBQWU7b0JBQ3BDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO29CQUN4QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztpQkFDdkIsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUixPQUFPLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbkQsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQUVELHNCQUFtQyxNQUFjLEVBQUUsTUFBc0M7O1FB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QUcsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQWpHRCxvQ0FpR0M7QUFFRCx1QkFBb0MsTUFBc0M7O1FBQ3RFLElBQUksQ0FBQztZQUNELElBQUksWUFBWSxHQUFHLGdFQUFnRTtnQkFDbkUsdUJBQXVCO2dCQUN2Qix3QkFBd0I7Z0JBQ3hCLDhDQUE4QztnQkFDOUMsd0JBQXdCLENBQUE7WUFDeEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7aUJBQzVDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztvQkFDM0MsTUFBTSxDQUFDO3dCQUNILFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUzt3QkFDeEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3dCQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87d0JBQ3BCLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztxQkFDM0IsQ0FBQztnQkFDTixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDVCxDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDTCxDQUFDO0NBQUE7QUF0QkQsc0NBc0JDIiwiZmlsZSI6ImFwcC9jb250cm9sbGVycy92b3RpbmdDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xyXG5pbXBvcnQgdGRzID0gcmVxdWlyZSgnLi4vdXRpbHMvdGRzLXByb21pc2VzJyk7XHJcbmltcG9ydCB7VFlQRVN9IGZyb20gJ3RlZGlvdXMnO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VXNlclZvdGVzX0ludGVybmFsKHVzZXJJZDogbnVtYmVyKTogUHJvbWlzZTxhbnlbXT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXCJTRUxFQ1Qgdi5JZCBhcyBWb3RlSWQsIHYuUGVyc29ubmVsTnVtYmVyLCB2LlZvdGVEYXRlLCB2LlVudGFwcGRJZCwgdi5CZWVyTmFtZSwgdi5CcmV3ZXJ5IFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRlJPTSBkYm8uVXNlclZvdGVzIHYgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIldIRVJFIHYuUGVyc29ubmVsTnVtYmVyID0gQHVzZXJJZCBBTkQgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiAgIHYuSXNDdXJyZW50ID0gMVwiO1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLnBhcmFtZXRlcigndXNlcklkJywgVFlQRVMuSW50LCB1c2VySWQpXHJcbiAgICAgICAgICAgIC5leGVjdXRlSW1tZWRpYXRlKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHMubWFwKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBWb3RlSWQ6IHJvdy5Wb3RlSWQsXHJcbiAgICAgICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IHJvdy5QZXJzb25uZWxOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBWb3RlRGF0ZTogcm93LlZvdGVEYXRlLFxyXG4gICAgICAgICAgICAgICAgVW50YXBwZElkOiByb3cuVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgQmVlck5hbWU6IHJvdy5CZWVyTmFtZSxcclxuICAgICAgICAgICAgICAgIEJyZXdlcnk6IHJvdy5CcmV3ZXJ5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byByZXRyaWV2ZSB2YWxpZCB2b3RlcyBmb3IgdXNlcjogJHt1c2VySWR9LiBEZXRhaWxzOiBgICsgZXguc3RhY2spO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnSW50ZXJuYWwgZXJyb3I6ICcgKyBleCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VyVm90ZXModXNlcklkOiBudW1iZXIsIG91dHB1dDogKHJlc3A6YW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIG91dHB1dCh7IGNvZGU6IDIwMCwgbXNnOiBhd2FpdCBnZXRVc2VyVm90ZXNfSW50ZXJuYWwodXNlcklkKSB9KTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQoeyBjb2RlOiA1MDAsIG1zZzogZXggfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXRVc2VyVm90ZXModXNlcklkOiBudW1iZXIsIHZvdGVzOiBhbnlbXSwgb3V0cHV0OiAocmVzcDphbnkpID0+IGV4cHJlc3MuUmVzcG9uc2UpIHtcclxuICAgIC8vIERvIHNvbWUgb2JqZWN0IHZhbGlkYXRpb25cclxuICAgIGlmICghdm90ZXMpIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0KHsgY29kZTogNDAwLCBtc2c6IGBCYWQgcmVxdWVzdC4gVGhlIHJlcXVlc3QgZG9lcyBub3QgaW5jbHVkZSBib2R5IGNvbnRlbnQgZGVzY3JpYmluZyB2b3RlIGluZm9ybWF0aW9uLmB9KTtcclxuICAgIH1cclxuICAgIG5ldyB0ZHMuVGRzQ29ubmVjdGlvbigpLnRyYW5zYWN0aW9uKGFzeW5jIChjb25uZWN0aW9uOiB0ZHMuVGRzQ29ubmVjdGlvbikgPT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB2b3Rlcy5tYXBBc3luYyhhc3luYyB2b3RlID0+IHtcclxuICAgICAgICAgICAgLy8gV29yayBvdXQgaWYgdGhpcyBpcyBhbiBJTlNFUlQgb3IgYW4gVVBEQVRFL0RFTEVURVxyXG4gICAgICAgICAgICBpZiAodm90ZS5Wb3RlSWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdm90ZS5VbnRhcHBkSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBERUxFVEUgdGhlIHZvdGVcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gJ0RFTEVURSBGUk9NIGRiby5Vc2VyVm90ZXMgV0hFUkUgSWQgPSBAdm90ZUlkJztcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjb25uZWN0aW9uLnNxbChzcWxTdGF0ZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3ZvdGVJZCcsIFRZUEVTLkludCwgdm90ZS5Wb3RlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5leGVjdXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBWb3RlSWQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHZvdGUgLSB1cGRhdGUgdGhlIGRldGFpbHMuIENoZWNrIGZpcnN0IHRoYXQgdGhpcyB2b3RlIGV4aXN0cyAmIGlzIGN1cnJlbnQuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNxbFN0YXRlbWVudCA9IFwiU0VMRUNUIHYuSWQgYXMgVm90ZUlkLCB2LlBlcnNvbm5lbE51bWJlciwgdi5Jc0N1cnJlbnQgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGUk9NIGRiby5Vc2VyVm90ZXMgdiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV0hFUkUgdi5JZCA9IEB2b3RlSWRcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0cyA9IGF3YWl0IHRkcy5kZWZhdWx0LnNxbChzcWxTdGF0ZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3ZvdGVJZCcsIFRZUEVTLkludCwgdm90ZS5Wb3RlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5leGVjdXRlSW1tZWRpYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYFNwZWNpZmllZCB2b3RlIGlkOiAke3ZvdGUuVm90ZUlkfSBkb2VzIG5vdCBleGlzdGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFyZXN1bHRzWzBdLklzQ3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBgQmFkIHJlcXVlc3QuIFRoZSBzcGVjaWZpZWQgdm90ZTogJHt2b3RlLlZvdGVJZH0gaXMgbm8gbG9uZ2VyIGN1cnJlbnQuIFRoaXMgdm90ZSBjYW5ub3QgYmUgdXBkYXRlZC5gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXN1bHRzWzBdLlBlcnNvbm5lbE51bWJlciAhPSB1c2VySWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYEJhZCByZXF1ZXN0LiBUaGUgc3BlY2lmaWVkIHZvdGU6ICR7dm90ZS5Wb3RlSWR9IGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCB1c2VyOiAke3VzZXJJZH0uYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3FsU3RhdGVtZW50ID0gXCJVUERBVEUgZGJvLlVzZXJWb3RlcyBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlNFVCBWb3RlRGF0ZSA9IEB2b3RlRGF0ZSwgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgICBVbnRhcHBkSWQgPSBAdW50YXBwZElkLCBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgIEJlZXJOYW1lID0gQGJlZXJOYW1lLCBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAgIEJyZXdlcnkgPSBAYnJld2VyeSBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIldIRVJFIElkID0gQHZvdGVJZFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRkcy5kZWZhdWx0LnNxbChzcWxTdGF0ZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3ZvdGVEYXRlJywgVFlQRVMuRGF0ZVRpbWUyLCBuZXcgRGF0ZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCd1bnRhcHBkSWQnLCBUWVBFUy5JbnQsIHZvdGUuVW50YXBwZElkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCdiZWVyTmFtZScsIFRZUEVTLk5WYXJDaGFyLCB2b3RlLkJlZXJOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCdicmV3ZXJ5JywgVFlQRVMuTlZhckNoYXIsIHZvdGUuQnJld2VyeSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmFtZXRlcigndm90ZUlkJywgVFlQRVMuSW50LCB2b3RlLlZvdGVJZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmV4ZWN1dGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFZvdGVJZDogdm90ZS5Wb3RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogdXNlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBWb3RlRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVW50YXBwZElkOiB2b3RlLlVudGFwcGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgQmVlck5hbWU6IHZvdGUuQmVlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEJyZXdlcnk6IHZvdGUuQnJld2VyeVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGRpbmcgYSBuZXcgdm90ZS4gQ2FuIG9ubHkgZG8gdGhpcyBpZiB0aGUgdXNlciBoYXMgbGVzcyB0aGFuIDIgYWN0aXZlIHZvdGVzXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZvdGVzID0gYXdhaXQgZ2V0VXNlclZvdGVzX0ludGVybmFsKHVzZXJJZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZvdGVzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgYEJhZCByZXF1ZXN0LiBUaGUgc3BlY2lmaWVkIHVzZXI6ICR7dXNlcklkfSBhbHJlYWR5IGhhcyAyIGFjdGl2ZSB2b3Rlcy4gQ3JlYXRpb24gb2YgbmV3IHZvdGVzIGlzIG5vdCBwZXJtaXR0ZWQgdW50aWwgMSBvciBtb3JlIG9mIHRoZSB2b3RlcyBsYXBzZXMuIEV4aXN0aW5nIHZvdGVzIG1heSBiZSB1cGRhdGVkLmA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgc3FsU3RhdGVtZW50ID0gXCJJTlNFUlQgSU5UTyBkYm8uVXNlclZvdGVzIChQZXJzb25uZWxOdW1iZXIsIFZvdGVEYXRlLCBVbnRhcHBkSWQsIEJlZXJOYW1lLCBCcmV3ZXJ5LCBJc0N1cnJlbnQpIFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVkFMVUVTIChAdXNlcklkLCBAdm90ZURhdGUsIEB1bnRhcHBkSWQsIEBiZWVyTmFtZSwgQGJyZXdlcnksIDEpOyBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlNFTEVDVCB2LklkIGFzIFZvdGVJZCwgdi5QZXJzb25uZWxOdW1iZXIsIHYuVm90ZURhdGUsIHYuVW50YXBwZElkLCB2LkJlZXJOYW1lLCB2LkJyZXdlcnkgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGUk9NIGRiby5Vc2VyVm90ZXMgdiBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIldIRVJFIHYuSWQgPSBTQ09QRV9JREVOVElUWSgpO1wiO1xyXG4gICAgICAgICAgICAgICAgbGV0IGluc2VydGVkVm90ZXMgPSBhd2FpdCB0ZHMuZGVmYXVsdC5zcWwoc3FsU3RhdGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3VzZXJJZCcsIFRZUEVTLkludCwgdXNlcklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3ZvdGVEYXRlJywgVFlQRVMuRGF0ZVRpbWUyLCBuZXcgRGF0ZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3VudGFwcGRJZCcsIFRZUEVTLkludCwgdm90ZS5VbnRhcHBkSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnBhcmFtZXRlcignYmVlck5hbWUnLCBUWVBFUy5OVmFyQ2hhciwgdm90ZS5CZWVyTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAucGFyYW1ldGVyKCdicmV3ZXJ5JywgVFlQRVMuTlZhckNoYXIsIHZvdGUuQnJld2VyeSlcclxuICAgICAgICAgICAgICAgICAgICAuZXhlY3V0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgaW5zZXJ0ZWRWb3RlID0gaW5zZXJ0ZWRWb3Rlc1swXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgVm90ZUlkOiBpbnNlcnRlZFZvdGUuVm90ZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogaW5zZXJ0ZWRWb3RlLlBlcnNvbm5lbE51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBWb3RlRGF0ZTogaW5zZXJ0ZWRWb3RlLlZvdGVEYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIFVudGFwcGRJZDogaW5zZXJ0ZWRWb3RlLlVudGFwcGRJZCxcclxuICAgICAgICAgICAgICAgICAgICBCZWVyTmFtZTogaW5zZXJ0ZWRWb3RlLkJlZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIEJyZXdlcnk6IGluc2VydGVkVm90ZS5CcmV3ZXJ5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgKHZvdGVzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIG91dHB1dCh7IGNvZGU6IDIwMSwgbXNnOiB2b3Rlcy5maWx0ZXIodm90ZSA9PiB2b3RlLlZvdGVJZCAhPSAwKSB9KTtcclxuICAgIH0sXHJcbiAgICAoZXg6IEVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gdXBzZXJ0IHZvdGUgZm9yIHVzZXI6ICR7dXNlcklkfS4gRGV0YWlsczogYCArIGV4LnN0YWNrKTtcclxuICAgICAgICByZXR1cm4gb3V0cHV0KHsgY29kZTogNTAwLCBtc2c6ICdJbnRlcm5hbCBFcnJvcjogJyArIGV4IH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWb3Rlc1RhbGx5KG91dHB1dDogKHJlc3A6YW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciBzcWxTdGF0ZW1lbnQgPSBcIlNFTEVDVCB2LlVudGFwcGRJZCwgdi5CZWVyTmFtZSwgdi5CcmV3ZXJ5LCBDT1VOVCgqKSBWb3RlQ291bnQgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJGUk9NIGRiby5Vc2VyVm90ZXMgdiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiV0hFUkUgdi5Jc0N1cnJlbnQgPSAxIFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiR1JPVVAgQlkgdi5VbnRhcHBkSWQsIHYuQmVlck5hbWUsIHYuQnJld2VyeSBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk9SREVSIEJZIENPVU5UKCopIERFU0NcIlxyXG4gICAgICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGRzLmRlZmF1bHQuc3FsKHNxbFN0YXRlbWVudClcclxuICAgICAgICAgICAgLmV4ZWN1dGVJbW1lZGlhdGUoKTtcclxuICAgICAgICByZXR1cm4gb3V0cHV0KHsgY29kZTogMjAwLCBtc2c6IHJlc3VsdHMubWFwKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IHJvdy5VbnRhcHBkSWQsXHJcbiAgICAgICAgICAgICAgICBCZWVyTmFtZTogcm93LkJlZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgQnJld2VyeTogcm93LkJyZXdlcnksXHJcbiAgICAgICAgICAgICAgICBWb3RlQ291bnQ6IHJvdy5Wb3RlQ291bnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KX0pO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcmV0cmlldmUgdm90ZXMgdGFsbHkuIERldGFpbHM6IGAgKyBleC5zdGFjayk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdJbnRlcm5hbCBlcnJvcjogJyArIGV4KTtcclxuICAgIH1cclxufVxyXG4iXX0=
