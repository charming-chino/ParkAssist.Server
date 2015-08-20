var redis     = require( 'redis' ),
    client    = redis.createClient(),
    bluebird  = require( 'bluebird' ),
    proximity = bluebird.promisifyAll( require( 'geo-proximity' ).initialize( client, {
      cache: true,
    }) );

module.exports = proximity;