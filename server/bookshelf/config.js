var knex = require( 'knex' )( {
  client: 'postgres',
  connection: {
    host: process.env.pg_host,
    user: process.env.pg_user,
    password: process.env.pg_password,
    database: process.env.pg_database,
    charset: 'utf8',
  },
});

module.exports = db = require( 'bookshelf' )( knex );

/**
 * All models/collections will automatically register themselves.
 */

db.plugin( 'registry' );

db.knex.schema.hasTable( 'meters' ).then( function ( exists ) {
  if ( !exists ) {
    db.knex.schema.createTable( 'meters', function ( meter ) {
      meter.increments( 'id' ).primary();
      meter.string( 'meter_id' ).unique();
      meter.decimal( 'longitude' );
      meter.decimal( 'latitude' );
      meter.boolean( 'active' );
      meter.integer( 'ordinal' );
      meter.string( 'event_type' );
      meter.string( 'event_time' );
    }).then( function ( table ) {
      process.verb( 'Created Table: meters' );
    });
  }
});