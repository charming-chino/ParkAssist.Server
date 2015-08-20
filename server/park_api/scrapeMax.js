var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    Meter     = require( '../bookshelf/models/meter' ),
    api       = require( './config' ),
    proximity = require( '../geohash/geohash' );

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

      process.send( results[0].ordinal );

      var removals = [];
      var additions = [];

      var proms = _.reduceRight( results, function ( memo, result ) {

        memo.push( db.model( 'Meter' ).fetchOrCreateMeter( result.meter_id )
        .then( function ( meter ) {

          meter.set( {
            event_type: result.event_type,
            event_time: result.event_time,
          });

          if ( meter.get( 'active' ) && result.event_type === 'SE' ) {
            removals = _.reject( removals, function ( removal ) { return removal === meter.get( 'id' ); } );
            if ( !_.find( additions, function ( add ) { return add[2] === meter.get( 'id' ); } ) ) {
              additions.push( [ meter.get( 'latitude' ), meter.get( 'longitude' ), meter.get( 'id' ) ] );
            }
          } else {
            additions = _.reject( additions, function ( add ) { return add[2] === meter.get( 'id' ); } );
            if ( !_.find( removals, function ( removal ) { return removal === meter.get( 'id' ); } ) ) {
              removals.push( meter.get( 'id' ) );
            }
          }

          return meter.save();

        }));

        return memo;
      }, []);

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
  .timeout( 180000 ) // 3 minute timeout
  .catch( bluebird.TimeoutError, function ( error ) {
    process.verb( 'API: Timed out', prevMax );
    setTimeout( max , 30000 );
  })
  .catch( function ( error ) {
    process.verb( 'API: Error', prevMax, error );
    setTimeout( max, 30000 );
  })
  .finally( function () {
    process.verb( 'Completed retrieval of 3 hours of events.' );
    process.exit( 0 );
  });
};