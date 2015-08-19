var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    Meter     = require( '../bookshelf/models/meter' ),
    api       = require( './config' );

module.exports = since = function () {

  var metersSince = api.metersSince();
  process.verb( 'URL:', metersSince );

  rp( metersSince )
  .promise()
  .then( function ( body, err ) {
    if ( err ) { process.verb( 'Error:', err ); }

    if ( !err ) {
      process.verb( 'Response:', metersSince );

      var results = JSON.parse( body );

      if ( results[0].ordinal !== process.env.ordinal ) {
        process.verb( 'Events:', results.length );

        _.eachRight( results, function ( result ) {
          db.model( 'Meter' ).fetchOrCreateMeter( result.meter_id )
          .then( function ( meter ) {

            meter.set( {
              event_type: result.event_type,
              event_time: result.event_time,
            });

            meter.save();

          });

          process.env.ordinal = results[0].ordinal;
          process.send( process.env.ordinal );
        });
      }
    }

    setTimeout( since, 3000 );
  })
  .timeout( 40000 ) // Time out if it takes longer than 40 seconds
  .catch( bluebird.TimeoutError, function ( error ) {
    setTimeout( since, 3000 );
  });

};