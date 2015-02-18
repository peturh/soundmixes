module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    src:{

        lessWatch : ['src/less/**/*.less'],
        less : ['src/less/stylesheets.less']
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: [
          'Gruntfile.js',
          'src/**/*.js',
          '!src/js/directives/angular-upload.js',
          '!src/js/vendors/moment.js',
          '!src/js/directives/angular-media-player.min.js',
          '!src/js/directives/wavesurfer-angular.js',
          '!src/js/vendors/wavesurfer.min.js'
      ],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
        files:['<%= src.lessWatch %>','<%= jshint.files %>'],
        tasks: ['jshint','recess:build','targethtml:dev']
    },
    targethtml: {
      dist: {
          files: {
              'dist/templates/cityselector.tpl.html' : 'src/templates/cityselector.tpl.html',
              'dist/templates/info-modal.tpl.html' : 'src/templates/info-modal.tpl.html',
              'dist/templates/infobuttons.tpl.html' : 'src/templates/infobuttons.tpl.html',
              'dist/templates/modal.tpl.html' : 'src/templates/modal.tpl.html',
              'dist/templates/sepandnum.tpl.html' : 'src/templates/sepandnum.tpl.html',
              'dist/index.html': 'src/index.html'
          }
      },
        dev: {
            files: {

                'src/errorfreeindex.html': 'src/index.html'
            }
        }
    },
    recess: {
      dist: {
          options: {
              compile: true,
              compress: true
          },
          files: {
              'dist/main.css': 'src/less/stylesheets.less'
          }
      },
        build : {
            options:{
                compile:true
            },
            files: {
                'src/main.css' : 'src/less/stylesheets.less'
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-targethtml');
  grunt.loadNpmTasks('grunt-recess');


  grunt.registerTask('default', ['jshint', 'concat', 'uglify','targethtml','recess:dist']);

};
