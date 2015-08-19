var db = require( '../config' );

var Meter = db.Model.extend({
  tableName: 'meters',

  //Instantiated stuff here!
}, {

  newMeter: function ( options ) {
    return new this( options );
  },

  fetchMeter: function ( id ) {
    return new this( { meter_id: id } ).fetch();
  },

  fetchOrCreateMeter: function ( id ) {
    return db.model( 'Meter' ).fetchMeter( id )
    .then( function ( meter ) {
      if (!meter) {
        meter = db.model( 'Meter' ).newMeter( { meter_id: id } );
      }

      return meter;
    });
  },

});

module.exports = db.model( 'Meter', Meter );