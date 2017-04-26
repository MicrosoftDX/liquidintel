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
const tds = require("./tds-promises");
const tedious_1 = require("tedious");
const request_promise = require("request-promise");
const untappdApiRoot = "https://api.untappd.com/v4/";
function isIntegrationEnabled() {
    return process.env.UntappdIntegration == "true";
}
exports.isIntegrationEnabled = isIntegrationEnabled;
function getBeerInfo(beerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var beerInfo = yield request_promise.get({
            uri: `${untappdApiRoot}beer/info/${beerId}?client_id=${process.env.UntappdClientId}&client_secret=${process.env.UntappdClientSecret}`,
            json: true
        });
        return {
            beer_name: beerInfo.beer.beer_name,
            brewery_name: beerInfo.brewery.brewery_name,
            beer_style: beerInfo.beer.beer_style,
            beer_abv: beerInfo.beer.beer_abv,
            beer_ibu: beerInfo.beer.beer_ibu,
            beer_description: beerInfo.beer.beer_description,
            beer_label_image: beerInfo.beer.beer_label
        };
    });
}
exports.getBeerInfo = getBeerInfo;
function postSessionCheckin(sessions) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var usersList = sessions.sort((lhs, rhs) => lhs.PersonnelNumber === rhs.PersonnelNumber ? 0 : (lhs.PersonnelNumber < rhs.PersonnelNumber ? -1 : 1))
                .filter((value, index, array) => {
                return !index || array[index - 1].PersonnelNumber != value.PersonnelNumber;
            })
                .map((session) => session.PersonnelNumber)
                .join(',');
            if (!usersList) {
                return null;
            }
            var sqlStatement = "SELECT PersonnelNumber, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare " +
                "FROM dbo.Users " +
                "WHERE PersonnelNumber IN (SELECT value FROM string_split(@users, ',')) AND " +
                "    UntappdAccessToken IS NOT NULL";
            var users = yield tds.default.sql(sqlStatement)
                .parameter('users', tedious_1.TYPES.NVarChar, usersList)
                .executeImmediate();
            return yield Promise.all(sessions
                .map((session) => { return { Session: session, User: users.find((user) => session.PersonnelNumber === user.PersonnelNumber) }; })
                .filter(session => session.User && session.Session.UntappdId)
                .map(session => {
                var params = {
                    client_id: process.env.UntappdClientId,
                    client_secret: process.env.UntappdClientSecret,
                    access_token: session.User.UntappdAccessToken,
                    gmt_offset: new Date().getTimezoneOffset() / 60,
                    bid: session.Session.UntappdId,
                    facebook: session.User.CheckinFacebook,
                    twitter: session.User.CheckinTwitter,
                    foursquare: session.User.CheckinFoursquare
                };
                var checkIn = request_promise.post({
                    uri: `${untappdApiRoot}checkin/add?` + Object.keys(params).map(param => `${param}=${params[param]}`).join('&'),
                    json: true
                });
            }));
        }
        catch (ex) {
            throw ex;
        }
    });
}
exports.postSessionCheckin = postSessionCheckin;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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bmltcG9ydCB0ZHMgPSByZXF1aXJlKCcuL3Rkcy1wcm9taXNlcycpO1xyXG5pbXBvcnQge1RZUEVTfSBmcm9tICd0ZWRpb3VzJztcclxuaW1wb3J0IHJlcXVlc3RfcHJvbWlzZSA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xyXG5pbXBvcnQge1Nlc3Npb259IGZyb20gJy4uL21vZGVscy9TZXNzaW9uJztcclxuXHJcbmNvbnN0IHVudGFwcGRBcGlSb290ID0gXCJodHRwczovL2FwaS51bnRhcHBkLmNvbS92NC9cIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVncmF0aW9uRW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBwcm9jZXNzLmVudi5VbnRhcHBkSW50ZWdyYXRpb24gPT0gXCJ0cnVlXCI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmVlckluZm8ge1xyXG4gICAgYmVlcl9uYW1lOiBzdHJpbmcsXHJcbiAgICBicmV3ZXJ5X25hbWU6IHN0cmluZyxcclxuICAgIGJlZXJfc3R5bGU6IHN0cmluZyxcclxuICAgIGJlZXJfYWJ2OiBudW1iZXIsXHJcbiAgICBiZWVyX2lidTogbnVtYmVyLFxyXG4gICAgYmVlcl9kZXNjcmlwdGlvbjogc3RyaW5nLFxyXG4gICAgYmVlcl9sYWJlbF9pbWFnZTogc3RyaW5nXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCZWVySW5mbyhiZWVySWQ6IG51bWJlcik6IFByb21pc2U8QmVlckluZm8+IHtcclxuICAgIHZhciBiZWVySW5mbyA9IGF3YWl0IHJlcXVlc3RfcHJvbWlzZS5nZXQoe1xyXG4gICAgICAgIHVyaTogYCR7dW50YXBwZEFwaVJvb3R9YmVlci9pbmZvLyR7YmVlcklkfT9jbGllbnRfaWQ9JHtwcm9jZXNzLmVudi5VbnRhcHBkQ2xpZW50SWR9JmNsaWVudF9zZWNyZXQ9JHtwcm9jZXNzLmVudi5VbnRhcHBkQ2xpZW50U2VjcmV0fWAsXHJcbiAgICAgICAganNvbjogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gPEJlZXJJbmZvPntcclxuICAgICAgICBiZWVyX25hbWU6IGJlZXJJbmZvLmJlZXIuYmVlcl9uYW1lLFxyXG4gICAgICAgIGJyZXdlcnlfbmFtZTogYmVlckluZm8uYnJld2VyeS5icmV3ZXJ5X25hbWUsXHJcbiAgICAgICAgYmVlcl9zdHlsZTogYmVlckluZm8uYmVlci5iZWVyX3N0eWxlLFxyXG4gICAgICAgIGJlZXJfYWJ2OiBiZWVySW5mby5iZWVyLmJlZXJfYWJ2LFxyXG4gICAgICAgIGJlZXJfaWJ1OiBiZWVySW5mby5iZWVyLmJlZXJfaWJ1LFxyXG4gICAgICAgIGJlZXJfZGVzY3JpcHRpb246IGJlZXJJbmZvLmJlZXIuYmVlcl9kZXNjcmlwdGlvbixcclxuICAgICAgICBiZWVyX2xhYmVsX2ltYWdlOiBiZWVySW5mby5iZWVyLmJlZXJfbGFiZWxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3N0U2Vzc2lvbkNoZWNraW4oc2Vzc2lvbnM6IFNlc3Npb25bXSk6IFByb21pc2U8YW55W10+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gV2UgbmVlZCB0byByZWR1Y2Ugb3VyIHNlc3Npb25zIGFycmF5IHRvIGV4dHJhY3QgYSB1bmlxdWUgbGlzdCBvZiB1c2Vyc1xyXG4gICAgICAgIHZhciB1c2Vyc0xpc3QgPSBzZXNzaW9ucy5zb3J0KChsaHM6IFNlc3Npb24sIHJoczogU2Vzc2lvbikgPT4gbGhzLlBlcnNvbm5lbE51bWJlciA9PT0gcmhzLlBlcnNvbm5lbE51bWJlciA/IDAgOiAobGhzLlBlcnNvbm5lbE51bWJlciA8IHJocy5QZXJzb25uZWxOdW1iZXIgPyAtMSA6IDEpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKCh2YWx1ZTogU2Vzc2lvbiwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFNlc3Npb25bXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICFpbmRleCB8fCBhcnJheVtpbmRleCAtIDFdLlBlcnNvbm5lbE51bWJlciAhPSB2YWx1ZS5QZXJzb25uZWxOdW1iZXJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm1hcCgoc2Vzc2lvbjogU2Vzc2lvbikgPT4gc2Vzc2lvbi5QZXJzb25uZWxOdW1iZXIpXHJcbiAgICAgICAgICAgIC5qb2luKCcsJyk7XHJcbiAgICAgICAgaWYgKCF1c2Vyc0xpc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzcWxTdGF0ZW1lbnQgPSBcIlNFTEVDVCBQZXJzb25uZWxOdW1iZXIsIFVudGFwcGRBY2Nlc3NUb2tlbiwgQ2hlY2tpbkZhY2Vib29rLCBDaGVja2luVHdpdHRlciwgQ2hlY2tpbkZvdXJzcXVhcmUgXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGUk9NIGRiby5Vc2VycyBcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcIldIRVJFIFBlcnNvbm5lbE51bWJlciBJTiAoU0VMRUNUIHZhbHVlIEZST00gc3RyaW5nX3NwbGl0KEB1c2VycywgJywnKSkgQU5EIFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICAgIFVudGFwcGRBY2Nlc3NUb2tlbiBJUyBOT1QgTlVMTFwiO1xyXG4gICAgICAgIHZhciB1c2VycyA9IGF3YWl0IHRkcy5kZWZhdWx0LnNxbChzcWxTdGF0ZW1lbnQpXHJcbiAgICAgICAgICAgIC5wYXJhbWV0ZXIoJ3VzZXJzJywgVFlQRVMuTlZhckNoYXIsIHVzZXJzTGlzdClcclxuICAgICAgICAgICAgLmV4ZWN1dGVJbW1lZGlhdGUoKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoc2Vzc2lvbnNcclxuICAgICAgICAgICAgLm1hcCgoc2Vzc2lvbjogU2Vzc2lvbikgPT4geyByZXR1cm4ge1Nlc3Npb246IHNlc3Npb24sIFVzZXI6IHVzZXJzLmZpbmQoKHVzZXIpID0+IHNlc3Npb24uUGVyc29ubmVsTnVtYmVyID09PSB1c2VyLlBlcnNvbm5lbE51bWJlcil9OyB9KVxyXG4gICAgICAgICAgICAuZmlsdGVyKHNlc3Npb24gPT4gc2Vzc2lvbi5Vc2VyICYmIHNlc3Npb24uU2Vzc2lvbi5VbnRhcHBkSWQpXHJcbiAgICAgICAgICAgIC5tYXAoc2Vzc2lvbiA9PiB7IFxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IHByb2Nlc3MuZW52LlVudGFwcGRDbGllbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiBwcm9jZXNzLmVudi5VbnRhcHBkQ2xpZW50U2VjcmV0LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogc2Vzc2lvbi5Vc2VyLlVudGFwcGRBY2Nlc3NUb2tlbixcclxuICAgICAgICAgICAgICAgICAgICBnbXRfb2Zmc2V0OiBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MCxcclxuICAgICAgICAgICAgICAgICAgICBiaWQ6IHNlc3Npb24uU2Vzc2lvbi5VbnRhcHBkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZmFjZWJvb2s6IHNlc3Npb24uVXNlci5DaGVja2luRmFjZWJvb2ssXHJcbiAgICAgICAgICAgICAgICAgICAgdHdpdHRlcjogc2Vzc2lvbi5Vc2VyLkNoZWNraW5Ud2l0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvdXJzcXVhcmU6IHNlc3Npb24uVXNlci5DaGVja2luRm91cnNxdWFyZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrSW4gPSByZXF1ZXN0X3Byb21pc2UucG9zdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJpOiBgJHt1bnRhcHBkQXBpUm9vdH1jaGVja2luL2FkZD9gICsgT2JqZWN0LmtleXMocGFyYW1zKS5tYXAocGFyYW0gPT4gYCR7cGFyYW19PSR7cGFyYW1zW3BhcmFtXX1gKS5qb2luKCcmJyksXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgIHRocm93IGV4O1xyXG4gICAgfVxyXG59Il19
