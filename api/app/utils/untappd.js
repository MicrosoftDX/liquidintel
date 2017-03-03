"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
//# sourceMappingURL=untappd.js.map