if(typeof(require) !== 'undefined') {
  var NoSleep = require('../lib/NoSleep');
}

var Helper = {};

Helper.fullscreenRequest = function(domElement) {
  if ( domElement.requestFullscreen ) {
    domElement.requestFullscreen();
  } else if ( domElement.msRequestFullscreen ) {
    domElement.msRequestFullscreen();
  } else if ( domElement.mozRequestFullScreen ) {
    domElement.mozRequestFullScreen();
  } else if ( domElement.webkitRequestFullscreen ) {
    domElement.webkitRequestFullscreen();
  }
};

Helper.fullscreenExit = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

Helper.fullscreenStatus = function() {
  // https://developer.mozilla.org/ko/docs/Web/API/Document/mozFullScreen
  // Note that the browser fullscreen (triggered by short keys) might
  // be considered different from content fullscreen when expecting a boolean

  // alternative standard methods
  var a = (document.fullscreenElement && document.fullscreenElement !== null);
  // current working methods
  var b = document.mozFullScreen || document.webkitIsFullScreen;
  return (a || b);
};


var _wakelock = new NoSleep();
var _wakelockEnabled = false;

Helper.enableWakelock = function() {
  if(!_wakelockEnabled) {
    _wakelock.enable();
    _wakelockEnabled = true;
  }
};

Helper.disableWakelock = function() {
  if(_wakelockEnabled) {
    _wakelock.disable();
    _wakelockEnabled = false;
  }
}


if(typeof(module) !== 'undefined') {
  module.exports = Helper;
}
