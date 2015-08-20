var db = require( '../config' );

var Meter = db.Model.extend({
  tableName: 'meters',

  //Instantiated stuff here!
}, {

  newMeter: function ( options ) {
    return new this( options );
  },

  fetchOrCreateMeter: function ( id ) {
    return new this( { meter_id: id } ).fetch()
    .then( function ( meter ) {

      if (!meter) {
        return db.model( 'Meter' ).newMeter( { meter_id: id } );
      } else { return meter; }

    });
  },

});

module.exports = db.model( 'Meter', Meter );