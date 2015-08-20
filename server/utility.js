var url = require( 'url' ),
    _   = require( 'lodash' );

process.isDev = function () { return process.env.NODE_ENV === 'development'; };
process.isProd = function () { return process.env.NODE_ENV === 'production'; };

process.verb = function () {
  if ( process.isDev() ) { console.log.apply( this, arguments ); }
};

module.exports.toISOString = function ( date ) {

  function pad( number ) {
    return (number < 10 ? '0' : '') + number;
  }

  return date.getUTCFullYear() +
  pad(date.getUTCMonth() + 1) +
  pad(date.getUTCDate()) +
  'T' + pad(date.getUTCHours()) +
  pad(date.getUTCMinutes()) +
  pad(date.getUTCSeconds()) +
  'Z';

};

module.exports.resolveURL = function () {
  return _.reduce( [].slice.call( arguments, 1 ), function ( memo, path ) {
    return url.resolve( memo, path );
  }, arguments[0]);
};