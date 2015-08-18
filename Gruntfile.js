var path = require('path');
require( 'dotenv' ).load();

module.exports = function( grunt ) {

  grunt.initConfig( {

    pkg: grunt.file.readJSON( 'package.json' ),

    express: {
      dev: {
        options: {
          script: 'server/server.js',
        }
      },
      production: {
        options: {
          background: false,
          script: 'server/server.js',
          node_env: 'production',
        }
      },
    },

    jshint: {
      options: {
        reporter: require( 'jshint-stylish' ),
      },
      dev: [ 'Gruntfile.js', './server/*.js', './server/**/*.js' ],
      production: [ 'Gruntfile.js', './server/*.js', 'server/**/*.js' ],
    },

    watch: {
      options: {
        livereload: true,
        //atBegin: true,
      },
      express: {
        files:  [ 'server/*.js', 'server/**/*.js' ],
        tasks:  [ 'dev_build', 'express:dev' ],
        options: {
          spawn: false,
        }
      },
    },
  });

  grunt.loadNpmTasks( 'grunt-notify' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-express-server' );

  grunt.registerTask( 'default', [ 'dev' ] );
  grunt.registerTask( 'dev_build', [ 'jshint:dev' ] );
  grunt.registerTask( 'dev', [ 'dev_build', 'express:dev', 'watch:express' ] );
  grunt.registerTask( 'prod_build', [ 'jshint:production' ] );
  grunt.registerTask( 'prod', [ 'prod_build', 'express:production' ] );

};
