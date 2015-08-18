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