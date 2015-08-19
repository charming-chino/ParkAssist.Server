var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    Meter     = require( '../bookshelf/models/meter' ),
    api       = require( './config' );

module.exports = max = function () {

  var prevMax = api.prevMaxEvents();
  process.verb( 'URL:', prevMax );

  rp( prevMax )
  .promise()
  .then( function ( body, err ) {
    if ( err ) { process.verb( 'Error:', err ); process.exit( 1 ); }

    if ( !err ) {
      process.verb( 'Response:', prevMax );

      var results = JSON.parse( body );
      process.verb( 'Events Max:', results.length );

      _.eachRight( results, function ( result ) {
        db.model( 'Meter' ).fetchOrCreateMeter( result.meter_id )
        .then( function ( meter ) {

          meter.set( {
            event_type: result.event_type,
            event_time: result.event_time,
          });

          meter.save();

        });
      });

      // Send latest ordinal to master
      process.send( results[0].ordinal );
      process.exit( 0 );
    }
  })
  .timeout( 180000 ) // 3 minute timeout
  .catch( bluebird.TimeoutError, function ( error ) {
    setTimeout( max , 30000 );
  });

};