module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      options: {
        pretty: true
      },
      build: {
        files: {
          'index.html': 'src/pages/index.jade',
          'twitter.html': 'src/pages/twitter.jade',
          'consultation.html': 'src/pages/consultation.jade'
        }
      }
    },
    bower_concat: {
      all: {
        dest: 'js/vendor.js',
        cssDest: 'css/vendor.css',
        options: {
          separator: ';\n'
        },
        mainFiles: {
          'font-awesome': './css/font-awesome.css'
        },
        exclude: [
          'html5shiv',
          'respond'
        ]
      }
    },
    less: {
      style: {
        options: {
          cleancss: true
        },
        files: {
          'css/main.css': 'src/styles/main.less'
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/scripts',
            src: 'main.js',
            dest: 'js/',
            filter: 'isFile'
          }
        ]
      },
      deps: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/font-awesome/fonts',
            src: '**',
            dest: 'fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/html5shiv/dist',
            src: '**/*.js',
            dest: 'js/vendor/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/respond/dist',
            src: '**/*.js',
            dest: 'js/vendor/',
            filter: 'isFile'
          }
        ]
      }
    },
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: false,
        createTag: false,
        push: false,
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['bump', 'watch']
      },
      vendor: {
        files: ['bower_components/**/*'],
        tasks: ['bower_concat', 'copy', 'bump'],
        options: {
          livereload: true
        }
      },
      pages: {
        files: ['src/pages/**/*.jade'],
        tasks: ['jade', 'bump'],
        options: {
          livereload: true
        }
      },
      scripts: {
        files: ['src/scripts/**/*.js', '!src/scripts/**/*.min.js'],
        tasks: ['copy:main', 'bump'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['src/styles/**/*.less'],
        tasks: ['less', 'bump'],
        options: {
          livereload: true
        }
      }
    },
    clean: {
      deps: ['node_modules', 'bower_components'],
      build: ['css/**/*.css', 'fonts/**/*', '!fonts/**/.gitkeep', 'js/**/*.js', '*.html', '!google730de77745fc3b20.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['copy', 'jade', 'bower_concat', 'less']);
  grunt.registerTask('default', ['build']);
};
