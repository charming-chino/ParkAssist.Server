var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    Meter     = require( '../bookshelf/models/meter' ),
    api       = require( './config' );

module.exports = meters = function () {

  var apiMeters = api.meters();

  process.verb( 'URL:', apiMeters );

  rp( apiMeters )
  .promise()
  .then( function ( body, err ) {

    if ( err ) { process.verb( 'Error:', err ); process.exit( 1 );  }

    if ( !err ) {
      process.verb( 'Response:', apiMeters );

      var results = JSON.parse( body );

      _.each( results, function ( result ) {

        var meter = db.model( 'Meter' )
        .fetchOrCreateMeter( result.meter_id )
        .then( function ( meter ) {
          meter.set( {
            active: result.active,
            latitude: result.latitude,
            longitude: result.longitude,
          });

          meter.save();
        });
      });

      process.exit( 0 );
    }
  })
  .timeout( 120000 ) // 2 minute timeout
  .catch( bluebird.TimeoutError, function ( error ) {
    setTimeout( meters, 30000 );
  });

};