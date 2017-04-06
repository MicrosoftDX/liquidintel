
import tds = require('./tds-promises');
import { TYPES } from 'tedious';
import request_promise = require('request-promise');
import { Activity } from '../models/Activity';
import moment = require('moment');
import tz = require('moment-timezone');

const untappdApiRoot = "https://api.untappd.com/v4/";

export function isIntegrationEnabled(): boolean {
    return process.env.UntappdIntegration == "true";
}

export interface BeerInfo {
    beer_name: string,
    brewery_name: string,
    beer_style: string,
    beer_abv: number,
    beer_ibu: number,
    beer_description: string,
    beer_label_image: string
}

export async function getBeerInfo(beerId: number): Promise<BeerInfo> {
    var uri = `${untappdApiRoot}beer/info/${beerId}?client_id=${process.env.UntappdClientId}&client_secret=${process.env.UntappdClientSecret}`;
    var beer = await request_promise.get({
        uri: uri,
        json: true
    });

    var beerInfo = beer.response;

    return <BeerInfo>{
        beer_name: beerInfo.beer.beer_name,
        brewery_name: beerInfo.beer.brewery.brewery_name,
        beer_style: beerInfo.beer.beer_style,
        beer_abv: beerInfo.beer.beer_abv,
        beer_ibu: beerInfo.beer.beer_ibu,
        beer_description: beerInfo.beer.beer_description,
        beer_label_image: beerInfo.beer.beer_label
    };
}

//TODO: Method to update untappd with what's new at the DX Bar

export async function postSessionCheckin(sessions: Activity[]): Promise<any[]> {
    try {
        // We need to reduce our sessions array to extract a unique list of users
        var usersList = sessions.sort((lhs: Activity, rhs: Activity) => lhs.PersonnelNumber === rhs.PersonnelNumber ? 0 : (lhs.PersonnelNumber < rhs.PersonnelNumber ? -1 : 1))
            .filter((value: Activity, index: number, array: Activity[]) => {
                return !index || array[index - 1].PersonnelNumber != value.PersonnelNumber
            })
            .map((session: Activity) => session.PersonnelNumber)
            .join(',');
        if (!usersList) {
            return null;
        }
        var sqlStatement = "SELECT PersonnelNumber, UntappdAccessToken, CheckinFacebook, CheckinTwitter, CheckinFoursquare " +
            "FROM dbo.Users " +
            "WHERE PersonnelNumber IN (SELECT value FROM string_split(@users, ',')) AND " +
            "    UntappdAccessToken IS NOT NULL";
        var users = await tds.default.sql(sqlStatement)
            .parameter('users', TYPES.NVarChar, usersList)
            .executeImmediate();
        var retVal = await sessions
            .map((session: Activity) => { return { Session: session, User: users.find((user) => session.PersonnelNumber === user.PersonnelNumber) }; })
            .filter(session => session.User && session.Session.UntappdId)
            .mapAsync(async session => {
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
                }

                try {
                    var checkin = await request_promise.post({
                        uri: `${untappdApiRoot}checkin/add?access_token=` + session.User.UntappdAccessToken,
                        form: params
                    });

                    var checkinResp = JSON.parse(checkin);
                    return { activityId: session.Session.SessionId, untappdCheckin: checkinResp.response }
                }
                catch (ex) {
                    return null;
                }
            });

        if (!!retVal && retVal.length > 0) {
            sqlStatement = "UPDATE dbo.[FactDrinkers] " +
                "SET [UntappdCheckinId]=@checkinId, " +
                "[UntappdBadgeName]=@badgeName, " +
                "[UntappdBadgeImageURL]=@imageUrl " +
                "WHERE [Id]=@activityId";

            var connection = new tds.TdsConnection();
            var updateUntappdCheckin = await connection.sql(sqlStatement)
                .parameter('checkinId', TYPES.Int, null)
                .parameter('badgeName', TYPES.NVarChar, null, { length: 500 })
                .parameter('imageUrl', TYPES.NVarChar, null, { length: 1000 })
                .parameter('activityId', TYPES.Int, null)
                .prepare();

            await retVal.forEachAsync(async activity => {
                var badgeName = null;
                var imageUrl = null;

                if (activity.untappdCheckin.badges.count > 0) {
                    badgeName = activity.untappdCheckin.badges.items[0].badge_name;             //limiting to only the first badge
                    imageUrl = activity.untappdCheckin.badges.items[0].badge_image.lg;
                }

                await updateUntappdCheckin.execute(false, false, {
                    checkinId: activity.untappdCheckin.checkin_id,
                    badgeName: badgeName,
                    imageUrl: imageUrl,
                    activityId: activity.activityId
                });
            });
            return await Promise.all(retVal);
        }
    }
    catch (ex) {
        throw ex;
    }
}