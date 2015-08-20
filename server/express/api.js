var proximity = require( '../geohash/geohash' ),
    bluebird  = require( 'bluebird' ),
    db        = require( '../bookshelf/config' ),
    Meter     = require( '../bookshelf/models/meter' ),
    Meters    = require( '../bookshelf/collections/meters' ),
    _         = require( 'lodash' );

var api = function ( app, router ) {
  router.get( '/meters/near/:lat/:lon', function ( req, res, next ) {
    var lat = parseFloat( req.params.lat );
    var lon = parseFloat( req.params.lon );

    process.verb( 'lat', lat, 'lon', lon );

    var rec = function (distance, variance) {
      return proximity.nearbyAsync( lat, lon, distance += variance )
      .then( function ( locs ) {
        if ( locs.length === 0 && distance < 1750 ) return rec( distance, variance + 25 );
        else {
          process.verb( 'locs', locs, 'distance', distance + variance );
          return locs;
        }
      });
    };

    bluebird.join( db.collection( 'Meters' ).newCollection().fetch(), rec( 50, 0 ) )
    .spread( function ( models, locs ) {

      var mapped = _.map( locs, function ( loc ) {
        return models.at( loc ).toJSON();
      });

      res.json( { meters: mapped } );
    });
  });

  return router;
};


module.exports = api;