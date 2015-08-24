module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      build: {
        files: {
          'index.html': 'src/pages/index.jade',
          'twitter.html': 'src/pages/twitter.jade',
          'consultation.html': 'src/pages/consultation.jade'
        }
      }
    },
    htmlmin: {
      build: {
        files: {
          'index.html': 'index.html',
          'twitter.html': 'twitter.html',
          'consultation.html': 'consultaiton.html'
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
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'js/main.min.js': 'js/main.js',
          'js/vendor.min.js': 'js/vendor.js'
        }
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
    cssmin: {
      build: {
        files: {
          'css/main.min.css': 'css/main.css',
          'css/vendor.min.css': 'css/vendor.css'
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
        tasks: ['build', 'bump', 'watch']
      },
      vendor: {
        files: ['bower_components/**/*'],
        tasks: ['bower_concat', 'uglify', 'cssmin', 'copy', 'bump'],
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
        tasks: ['copy:main', 'uglify', 'bump'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['src/styles/**/*.less'],
        tasks: ['less', 'cssmin', 'bump'],
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
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['copy', 'jade', 'htmlmin', 'bower_concat', 'uglify', 'less', 'cssmin']);
  grunt.registerTask('default', ['build']);
};
