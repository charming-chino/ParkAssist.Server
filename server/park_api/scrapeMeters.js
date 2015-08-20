var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    api       = require( './config' );
    proximity = require( '../geohash/geohash' );

require( '../bookshelf/models/meter' );

module.exports = meters = function ( first ) {

  var apiMeters = api.meters();

  process.verb( 'URL:', apiMeters );

  rp( apiMeters )
  .promise()
  .then( function ( body, err ) {

    if ( err ) { process.verb( 'Error:', err ); process.exit( 1 );  }

    if ( !err ) {
      process.verb( 'Response:', apiMeters );

      var results = JSON.parse( body );

      var additions = [];
      var removals = [];

      var proms = _.map( results, function ( result ) {
        return db.model( 'Meter' )
        .fetchOrCreateMeter( result.meter_id )
        .then( function ( meter ) {

          meter.set( {
            active: result.active,
            latitude: result.latitude,
            longitude: result.longitude,
          });

          if ( result.active && meter.get( 'event_type' ) !== 'SS' ) {
            if ( first ) {
              additions.push([ result.latitude, result.longitude, meter.get( 'id' ) ]);
            }
          } else {
            removals.push([ meter.get( 'id' ) ]);
          }

          return meter.save();
        });

      });

      return bluebird.all( proms )
      .then( function () {
        var proms = [];
        process.verb( 'Removals', removals.length, 'Additions', additions.length );
        if ( removals.length > 0 ) proms.push( proximity.removeLocationsAsync( removals ) );
        if ( additions.length > 0 ) proms.push( proximity.addLocationsAsync( additions ) );
        if ( proms.length > 0 ) {
          return bluebird.all( proms );
        }
      });
    }
  })
  .timeout( 120000 ) // 2 minute timeout
  .catch( bluebird.TimeoutError, function ( error ) {
    process.verb( 'API Timed out:', apiMeters );
    setTimeout( meters, 30000 );
  })
  .catch( function ( error ) {
    process.verb( 'API Error:', apiMeters, error );
    setTimeout( meters, 30000 );
  })
  // .then( function ( meters ) {
  //   process.verb( 'Saved all meters!' );
  // })
  .finally( function () {
    process.verb( 'Completed retrieval of meters.' );
    process.exit( 0 );
  });

};