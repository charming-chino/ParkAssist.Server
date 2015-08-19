var url       = require( 'url' ),
    utility   = require( '../utility' );

var api_url = 'https://parking.api.smgov.net';
var maxLife = 3;

var api = {};

api.meters = function () {
  return utility.resolveURL( api_url, '/meters/' );
};

api.metersSince = function () {
  return utility.resolveURL( api.meters(), 'events/since/', process.env.ordinal );
};

api.ordinal = function () {
  return utility.resolveURL( api.meters(), 'events/latest' );
};

api.prevMaxEvents = function () {
  var date = new Date();
  date.setHours( date.getHours() - maxLife );
  date.setMinutes( date.getMinutes() + 1 );

  return utility.resolveURL( api.meters(), 'events/since/', utility.toISOString( date ) );
};

module.exports = api;