var moment = require('moment')
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;
var env = require('dotenv').load();

function keg(name, tapId, volumeInGallons, brewery, beerType, abv, ibu, beerDescription, untappdId, imagePath){
    this.name = name;
    this.tapId = tapId;
    this.volumeInGallons = volumeInGallons;

    this.brewery = brewery;
    this.beerType = beerType;
    this.abv = abv;
    this.ibu = ibu;
    this.beerDescription = beerDescription;
    this.untappdId = untappdId;
    this.imagePath = imagePath;
    var date = new Date();
    this.installDate = moment.utc().format("YYYY-MM-DD hh:mm:ss");
}

keg.prototype = {

}