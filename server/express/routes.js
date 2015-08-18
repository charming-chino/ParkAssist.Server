var path = require( 'path' );

var routes = function ( app, express ) {
  var router = require( './api' )( app, express.Router() );

  app.use( '/api', router );
};

module.exports = routes;