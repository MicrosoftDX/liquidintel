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
        var uri = `${untappdApiRoot}beer/info/${beerId}?client_id=${process.env.UntappdClientId}&client_secret=${process.env.UntappdClientSecret}`;
        var beer = yield request_promise.get({
            uri: uri,
            json: true
        });
        var beerInfo = beer.response;
        return {
            beer_name: beerInfo.beer.beer_name,
            brewery_name: beerInfo.beer.brewery.brewery_name,
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
            var retVal = yield sessions
                .map((session) => { return { Session: session, User: users.find((user) => session.PersonnelNumber === user.PersonnelNumber) }; })
                .filter(session => session.User && session.Session.UntappdId)
                .mapAsync((session) => __awaiter(this, void 0, void 0, function* () {
                var params = {
                    gmt_offset: new Date().getTimezoneOffset() / 60,
                    timezone: process.env.Timezone,
                    bid: session.Session.UntappdId,
                    foursquare_id: process.env.FourSquareVenueId,
                    geolat: process.env.VenueLat,
                    geolng: process.env.VenueLong,
                    facebook: session.User.CheckinFacebook,
                    twitter: session.User.CheckinTwitter,
                    foursquare: session.User.CheckinFoursquare
                };
                try {
                    var checkin = yield request_promise.post({
                        uri: `${untappdApiRoot}checkin/add?access_token=` + session.User.UntappdAccessToken,
                        form: params
                    });
                    var checkinResp = JSON.parse(checkin);
                    return { activityId: session.Session.SessionId, untappdCheckin: checkinResp.response };
                }
                catch (ex) {
                    return null;
                }
            }));
            if (!!retVal && retVal.length > 0) {
                sqlStatement = "UPDATE dbo.[FactDrinkers] " +
                    "SET [UntappdCheckinId]=@checkinId, " +
                    "[UntappdBadgeName]=@badgeName, " +
                    "[UntappdBadgeImageURL]=@imageUrl " +
                    "WHERE [Id]=@activityId";
                var connection = new tds.TdsConnection();
                var updateUntappdCheckin = yield connection.sql(sqlStatement)
                    .parameter('checkinId', tedious_1.TYPES.Int, null)
                    .parameter('badgeName', tedious_1.TYPES.NVarChar, null, { length: 500 })
                    .parameter('imageUrl', tedious_1.TYPES.NVarChar, null, { length: 1000 })
                    .parameter('activityId', tedious_1.TYPES.Int, null)
                    .prepare();
                yield retVal.forEachAsync((activity) => __awaiter(this, void 0, void 0, function* () {
                    var badgeName = null;
                    var imageUrl = null;
                    if (activity.untappdCheckin.badges.count > 0) {
                        badgeName = activity.untappdCheckin.badges.items[0].badge_name;
                        imageUrl = activity.untappdCheckin.badges.items[0].badge_image.lg;
                    }
                    yield updateUntappdCheckin.execute(false, false, {
                        checkinId: activity.untappdCheckin.checkin_id,
                        badgeName: badgeName,
                        imageUrl: imageUrl,
                        activityId: activity.activityId
                    });
                }));
                return yield Promise.all(retVal);
            }
        }
        catch (ex) {
            throw ex;
        }
    });
}
exports.postSessionCheckin = postSessionCheckin;
//# sourceMappingURL=untappd.js.map