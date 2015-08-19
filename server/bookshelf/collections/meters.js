var db    = require( '../config' );
    Meter = require( '../models/meter' );

var Meters = db.Collection.extend( {
  model: Meter,

  fetchMeter: function ( meterid ) {
    return this.where( { 'meter_id': meterid } ).fetchOne();
  },

}, {

  newCollection: function () {
    return new this();
  },

});

module.exports = db.collection( 'Meters', Meters );