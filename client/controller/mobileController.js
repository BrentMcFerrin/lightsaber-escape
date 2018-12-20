const ConnectionManager = require('../connectionManager');
const SceneManager = require('../sceneManager');
const LightsaberControls = require('../lightsaberControls');
const MeshProvider = require('../meshProvider');
const { DataType, ControlType } = require('../models');
const UrlUtils = require('../utils/urlUtils');

// let playerId = (location.pathname+location.search).substr(1).split('/')[0];
let playerId = UrlUtils.getParams()['id'];
let _connectionManager = new ConnectionManager(playerId);

let width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

let _viewportContainer = document.getElementById('viewport');
let _sceneManager = new SceneManager(_viewportContainer, width, height);
let _meshProvider = new MeshProvider();

let _lightsaber = _meshProvider.getDummyModel();
let _lightsaberControls = null;

// Elements
const initiateButton = document.getElementById('initiate');
const calibrateButton = document.getElementById('calibrate');
const loader = document.getElementById('hex-loader');
const headingTitle = document.getElementById('heading-title');
const headingSubTitle = document.getElementById('heading-sub-title');
const headingDetails = document.getElementById('heading-details');

setupUi();
function setupUi() {

  var phoneUrl = document.getElementById("phoneUrl");
  if (phoneUrl) {
    if (playerId) {
      // hide this element
      phoneUrl.classList.add("force-hide");
    } else {
      const url = 'http://00185c34.ngrok.io/' + _connectionManager.connectionId;
      phoneUrl.href = url;
      phoneUrl.innerHTML = url;
    }    
  }  

  _sceneManager.addObjectToScene(_lightsaber);
  _lightsaberControls = new LightsaberControls(_lightsaber);

  _connectionManager.addListener(DataType.CONTROL, controlData => {
    switch(controlData) {
      case ControlType.CONNECTED:
        break;
      case ControlType.CALIBRATED:
        setTimeout(() => {
          headingTitle.style.display = 'block';
          headingTitle.innerHTML = 'CALIBRATION COMPLETE';

          headingSubTitle.style.display = 'block';
          headingSubTitle.innerHTML = 'You\'re ready to begin your escape';
          
          headingDetails.style.display = 'block';
          initiateButton.style.display = 'none';
        }, 2000);
        break;
      case ControlType.ON:
        break;
      case ControlType.OFF:
        break;
    }
  });

  _connectionManager.addListener(DataType.ORIENTATION, orientation => 
    _lightsaberControls.setOrientation(orientation)
  );

  calibrateButton.addEventListener('click', function (e) {
    _lightsaberControls.setInitialOrientation();    
  });

  var animate = function () {
    requestAnimationFrame( animate );

    if (playerId) {
      _lightsaberControls.update();
      _connectionManager.sendOrientationData(_lightsaberControls.orientation());
    } else {
      _sceneManager.render();
    }

  };
  animate();

  initiateButton.disabled = false;
}

initiateButton.addEventListener('click', function (e) {
  initiateButton.disabled = true;
  console.log('connecting to view...');
  // socket.emit('go-private', true);
  _connectionManager.startConnection();
  _lightsaberControls.setInitialOrientation();

  // requestFullScreen();
  
  loader.classList.add('calibrate');

  headingTitle.style.display = 'none';
  headingSubTitle.style.display = 'none';
  initiateButton.style.display = 'none';

});

// // fullscreen
// var fullscreenButton = document.getElementById('fullscreen')
// fullscreenButton.addEventListener('click', function (e) {
//   requestFullScreen();
// });

function requestFullScreen() {
  var el = document.body;
  // Supports most browsers and their versions.
  var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen 
  || el.mozRequestFullScreen || el.msRequestFullScreen;

  if (requestMethod) {
    // Native full screen.
    requestMethod.call(el);
  } else if (typeof window.ActiveXObject !== "undefined") {
    // Older IE.
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}
