var express           = require( 'express' ),
    morgan            = require( 'morgan' ),
    bodyParser        = require( 'body-parser' ),
    session           = require( 'express-session' ),
    SessionStore      = require( 'express-sql-session' )( session ),
    http              = require( 'http' );

// Initialize express
var app = express();
var server = http.Server( app );

// Dev logging
if ( process.isDev() ) {
  app.use( morgan( 'dev' ) );
}

// Sessions
var options = {
  client: 'postgres',
  connection: {
    host: process.env.pg_host,
    user: process.env.pg_user,
    password: process.env.pg_password,
    database: process.env.pg_database,
    charset: 'utf8',
  },
  table: 'sessions',
  expires: 365 * 24 * 60 * 60 * 1000
};

var sessionStore = new SessionStore( options );

app.use( session( {
  key: process.env.session_key,
  secret: process.env.session_secret,
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
}));

// JSON support for body parsing
app.use( bodyParser.json() );

// Body parser
app.use( bodyParser.urlencoded( { extended: true } ) );

// Initialize our routes
require( './routes.js' )( app, express );

server.listen( 8000 );

// Export express
module.exports = app;