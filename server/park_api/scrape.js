var cluster   = require( 'cluster' ),
    ordinal = '';

if ( cluster.isMaster ) {
  // Create a scrape max fork and execute it
  scrapeMetersFork( true );

} else if ( process.env.worker ) {
  require( process.env.worker )();
}

function scrapeMetersFork( first ) {
  var scrapeMeters = cluster.fork( { worker: './scrapeMeters', NODE_ENV: process.env.NODE_ENV, first: first } );

  scrapeMeters.on( 'exit', function ( code, signal ) {
    if ( code ) { // We had an error, so let's try again in 30 seconds.
      setTimeout( scrapeMetersFork, 30000 );
    }
    else {
      if ( first ) {
        setTimeout( scrapeMaxFork, 30000 ); // Wait 30 seconds, then get all of the past events
      }

      setTimeout( scrapeMetersFork, 86400000, false ); // Wait 1 day, then get the meters again!
    }
  });
}

function scrapeSinceFork() {

  var scrapeSince = cluster.fork( { worker: './scrapeSince', ordinal: ordinal, NODE_ENV: process.env.NODE_ENV } );

  scrapeSince.on( 'message', function ( message ) {
    ordinal = message;
  });

  scrapeSince.on( 'exit', function ( code, signal ) {
    scrapeSinceFork();
  });
}

function scrapeMaxFork() {

  // Create fork for scraping last 3 hours.
  var scrapeMax = cluster.fork( { worker: './scrapeMax', NODE_ENV: process.env.NODE_ENV } );

  scrapeMax.on( 'message', function ( message ) {
    ordinal = message;
  });

  // Add a listener for when it is done.
  scrapeMax.on( 'exit', function ( code, signal ) {
    if ( code ) { // It errored!
      scrapeMaxFork();
    } else {
      scrapeSinceFork();
    }
  });

}

module.exports = cluster;