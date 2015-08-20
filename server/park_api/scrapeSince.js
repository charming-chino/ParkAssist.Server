var _         = require( 'lodash' ),
    rp        = require( 'request-promise' ),
    db        = require( '../bookshelf/config' ),
    bluebird  = require( 'bluebird' ),
    Meter     = require( '../bookshelf/models/meter' ),
    api       = require( './config' ),
    proximity = require( '../geohash/geohash' );

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
        //process.verb( 'Events:', results.length );

        var removals = [];
        var additions = [];

        var proms = _.reduceRight( results, function ( memo, result ) {

          process.env.ordinal = results[0].ordinal;

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
    }

    setTimeout( since, 3000 );
  })
  .timeout( 40000 ) // Time out if it takes longer than 40 seconds
  .catch( bluebird.TimeoutError, function ( error ) {
    process.verb( 'API Timed out:', metersSince );
    setTimeout( since, 3000 );
  })
  .catch( function ( error ) {
    process.verb( 'API Error:', metersSince, error );
    setTimeout( since, 3000 );
  })
  .finally( function () {
    process.send( process.env.ordinal );
  });

};