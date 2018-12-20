const ConnectionManager = require('./connectionManager');
const SceneManager = require('./sceneManager');
const LightsaberControls = require('./lightsaberControls');
const MeshProvider = require('./meshProvider');
const { DataType, ControlType } = require('./models');
const UrlUtils = require('./utils/urlUtils');

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
let _meshProvider = new MeshProvider(true);

let _lightsaber = null; //_meshProvider.getLightsaber();
let _lightsaberControls = null; // new LightsaberControls(_lightsaber);

// Elements
const mainMenuUi = document.getElementById('main-menu-ui');
const instructionUi = document.getElementById('instruction-ui');
const loadingUi = document.getElementById('loading-ui');
// const privateButton = document.getElementById('private')
// const calibrateButton = document.getElementById('calibrate')
// const form = document.getElementById('msg-form')
// const box = document.getElementById('msg-box')
// const boxFile = document.getElementById('msg-file')
// const msgList = document.getElementById('msg-list')
// const upgradeMsg = document.getElementById('upgrade-msg')

setupUi();
function setupUi() {

  var phoneUrl = document.getElementById("phoneUrl");
  if (phoneUrl) {
    if (playerId) {
      // hide this element
      phoneUrl.classList.add("force-hide");
    } else {
      const url = '00185c34.ngrok.io/' + _connectionManager.connectionId;
      phoneUrl.href = 'http://' + url;
      phoneUrl.innerHTML = url;
    }    
  }

  // testing
  // setTimeout(() => {
  //   // load the lightsaber model
  //   _lightsaber = _meshProvider.getLightsaber();
  //   _sceneManager.addObjectToScene(_lightsaber);
  //   _lightsaberControls = new LightsaberControls(_lightsaber);
  // }, 3000);

  // _sceneManager.addObjectToScene(_lightsaber);
  // _lightsaberControls = new LightsaberControls(_lightsaber);

  _connectionManager.addListener(DataType.CONTROL, controlData => {
    switch(controlData) {
      case ControlType.CONNECTED:
        showCalibrateInstructions();
        break;
      case ControlType.CALIBRATED:
        showLoading();
        setTimeout(() => hideMainUi(), 5000); // simulate loading 3d stuff
        // hideMainUi();

        // load the lightsaber model
        _lightsaber = _meshProvider.getLightsaber();
        _sceneManager.addObjectToScene(_lightsaber);
        _lightsaberControls = new LightsaberControls(_lightsaber);

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

  // var controls = new THREE.DeviceOrientationControls( _lightsaber, true );

  // calibrateButton.addEventListener('click', function (e) {
  //   _lightsaberControls.setInitialOrientation();    
  // });

  var animate = function () {
    requestAnimationFrame( animate );

    // testing
    // if (_lightsaber) {
    //   _lightsaber.rotation.z += 0.01;
    // }

    if (playerId) {
      _lightsaberControls.update();
      // socket.emit('peer-msg', _lightsaberControls.orientation());
      _connectionManager.sendOrientationData(_lightsaberControls.orientation());
    } else {
      _sceneManager.render();
    }

  };
  animate();

  // window.addEventListener('deviceorientation', function(e) {
  //   var gammaRotation = e.gamma ? e.gamma * (Math.PI / 600) : 0;
  //   _lightsaber.rotation.y = gammaRotation;
  // });

  // privateButton.disabled = false;
}

function hideMainUi() {
  // mainMenuUi.style.display = 'none';
  loadingUi.classList.add("force-hide");
  mainMenuUi.classList.add("force-hide");
  instructionUi.classList.add("force-hide");
}

function showCalibrateInstructions() {
  console.log('Showing Instructions...');
  instructionUi.classList.remove("force-hide");
}

function showLoading() {
  console.log('Showing Loading UI...');
  loadingUi.classList.remove("force-hide");
}


// socket.on('connect', function() {
//   console.log('Connected to signalling server, Peer ID: %s', socket.id);
//   privateButton.disabled = false;
// });

// socket.on('peer-msg', function (rotation) {
//   if(location.hash === '#1') {
//     console.log('orientation data = \n', rotation);
//     // var rotation = JSON.parse(data);
//     _lightsaber.rotation.x = rotation.x;
//     _lightsaber.rotation.y = rotation.y;
//     _lightsaber.rotation.z = rotation.z;
//   } else {
//     // peer.send("hello, my lord");
//   }
//   // var li = document.createElement('li')
//   // li.appendChild(document.createTextNode(data.textVal))
//   // msgList.appendChild(li)
// });

// socket.on('peer', function(data) { // go private
//   var peerId = data.peerId;
//   // var peer = new Peer({ initiator: data.initiator, trickle: useTrickle });
//   var peer = new Peer({ initiator: location.hash === '#1', trickle: useTrickle });

//   console.log('Peer available for connection discovered from signalling server, Peer ID: %s', peerId);

//   socket.on('signal', function(data) {
//     if (data.peerId == peerId) {
//       console.log('Received signalling data', data, 'from Peer ID:', peerId);
//       peer.signal(data.signal);
//     }
//   });

//   peer.on('signal', function(data) {
//     console.log('Advertising signalling data', data, 'to Peer ID:', peerId);
//     socket.emit('signal', {
//       signal: data,
//       peerId: peerId
//     });
//   });
//   peer.on('error', function(e) {
//     console.log('Error sending connection to peer %s:', peerId, e);
//   });
//   peer.on('connect', function() {
//     console.log('Peer connection established');
//     goPrivate();
//     if(location.hash === '#1') {
//       peer.send("hi, bitch");
//     } else {
//       peer.send("hello, my lord");
//     }
//   });
//   peer.on('data', function(data) {
//     var string = new TextDecoder("utf-8").decode(data);
//     console.log('Recieved data from peer:', string);
//     var li = document.createElement('li')
//     li.appendChild(document.createTextNode(string))
//     msgList.appendChild(li)
//   });
//   peers[peerId] = peer;
//   me = peer;
// });

// form.addEventListener('submit', function (e, d) {
//   e.preventDefault()
//   var li = document.createElement('li')
//   li.appendChild(document.createTextNode(box.value))
//   msgList.appendChild(li)
//   if (boxFile && boxFile.value !== '') {
//     var reader = new window.FileReader()
//     reader.onload = function (evnt) {
//       socket.emit('peer-file', {file: evnt.target.result})
//     }
//     reader.onerror = function (err) {
//       console.error('Error while reading file', err)
//     }
//     reader.readAsArrayBuffer(boxFile.files[0])
//   } else {
//     if (me) {
//       me.send(box.value);
//     } else {
//       socket.emit('peer-msg', {textVal: box.value});
//     }    
//   }
//   box.value = ''
//   boxFile.value = ''
// });


// privateButton.addEventListener('click', function (e) {
//   goPrivate();
//   console.log('going private...');
//   // socket.emit('go-private', true);
//   _connectionManager.startConnection();
// });

// function goPrivate () {
//   // upgradeMsg.innerHTML = 'WebRTC connection established!';
//   privateButton.disabled = true;
// }



// // fullscreen
// var fullscreenButton = document.getElementById('fullscreen')
// fullscreenButton.addEventListener('click', function (e) {
//   requestFullScreen();
// });
// function requestFullScreen() {

//   var el = document.body;

//   // Supports most browsers and their versions.
//   var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen 
//   || el.mozRequestFullScreen || el.msRequestFullScreen;

//   if (requestMethod) {

//     // Native full screen.
//     requestMethod.call(el);

//   } else if (typeof window.ActiveXObject !== "undefined") {

//     // Older IE.
//     var wscript = new ActiveXObject("WScript.Shell");

//     if (wscript !== null) {
//       wscript.SendKeys("{F11}");
//     }
//   }
// }
