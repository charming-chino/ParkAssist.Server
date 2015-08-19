require( 'dotenv' ).load();

require( './utility' );

var db = require( './bookshelf/config.js' );

// Load our scraping minions!
var cluster = require( './park_api/scrape' );

if ( cluster.isMaster ) {
  module.exports = app = require( './express/express.js' );
}