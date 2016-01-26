var browserify   = require('browserify');
var babelify     = require('babelify');
var strictify    = require('strictify');
var watchify     = require('watchify');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var notify       = require('gulp-notify');
var source       = require('vinyl-source-stream');
var glob         = require('glob');

var scriptsDir = './src';
var buildDir = './www';

var buildScript = function(file) {
  var bundler = watchify(browserify(scriptsDir + '/' + file, watchify.args));

  bundler.transform(strictify);
  bundler.transform(babelify, {presets:["react"]});

  bundler.on('update', rebundle);

  function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
      title: "Compile Error",
      message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
  }

  function rebundle() {
    return bundler.bundle()
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest(buildDir));
  }

  return rebundle();
};

gulp.task('default', function (){
  glob(scriptsDir + '/*_main.js', null, function (er, files){
    for (var i=0; i< files.length; i++){
      var filename = files[i].replace(/^.*[\\\/]/, '');
      buildScript(filename);
    }
  });
  
});


