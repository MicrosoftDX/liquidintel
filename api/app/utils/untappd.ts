
import tds = require('./tds-promises');
import {TYPES} from 'tedious';
import request_promise = require('request-promise');
import {Session} from '../models/Session';

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
    var beerInfo = await request_promise.get({
        uri: `${untappdApiRoot}beer/info/${beerId}?client_id=${process.env.UntappdClientId}&client_secret=${process.env.UntappdClientSecret}`,
        json: true
    });
    return <BeerInfo>{
        beer_name: beerInfo.beer.beer_name,
        brewery_name: beerInfo.brewery.brewery_name,
        beer_style: beerInfo.beer.beer_style,
        beer_abv: beerInfo.beer.beer_abv,
        beer_ibu: beerInfo.beer.beer_ibu,
        beer_description: beerInfo.beer.beer_description,
        beer_label_image: beerInfo.beer.beer_label
    };
}

export async function postSessionCheckin(sessions: Session[]): Promise<any[]> {
    try {
        // We need to reduce our sessions array to extract a unique list of users
        var usersList = sessions.sort((lhs: Session, rhs: Session) => lhs.PersonnelNumber === rhs.PersonnelNumber ? 0 : (lhs.PersonnelNumber < rhs.PersonnelNumber ? -1 : 1))
            .filter((value: Session, index: number, array: Session[]) => {
                return !index || array[index - 1].PersonnelNumber != value.PersonnelNumber
            })
            .map((session: Session) => session.PersonnelNumber)
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
        return await Promise.all(sessions
            .map((session: Session) => { return {Session: session, User: users.find((user) => session.PersonnelNumber === user.PersonnelNumber)}; })
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
                }
                var checkIn = request_promise.post({
                    uri: `${untappdApiRoot}checkin/add?` + Object.keys(params).map(param => `${param}=${params[param]}`).join('&'),
                    json: true
                });
            }));
    }
    catch (ex) {
        throw ex;
    }
}