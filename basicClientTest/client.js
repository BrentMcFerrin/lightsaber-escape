var Peer = require('simple-peer');
var io = require('socket.io-client');
var socket = io.connect();
var peers = {};
var useTrickle = true;

var me = null;

// Elements
var privateButton = document.getElementById('private')
var calibrateButton = document.getElementById('calibrate')
var form = document.getElementById('msg-form')
var box = document.getElementById('msg-box')
var boxFile = document.getElementById('msg-file')
var msgList = document.getElementById('msg-list')
var upgradeMsg = document.getElementById('upgrade-msg')

// 3d
var geometry = new THREE.BoxGeometry( 0.25, 5, 0.25 );
geometry.translate(0, 2, 0);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );

var orientationData = { x:0, y:0, z:0 };
var _initialOrientationData = { x:0, y:0, z:0 };

setupUi();
function setupUi() {
  // setup 3D view
  var viewportContainer = document.getElementById('viewport');
  var w = 800; // window.innerWidth
  var h = 600; // window.innerHeight
  var scene = new THREE.Scene();
  var camera = createCamera(w, h); // new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
  // var textureLoader = new THREE.TextureLoader();
  var renderer = createRenderer(w, h); // new THREE.WebGLRenderer();
  renderer.setSize( w, h );
  viewportContainer.appendChild( renderer.domElement );

  scene.add( cube );
  scene.add( createLight() );
  scene.add( createHemisphereLight() );

  var controls = new THREE.DeviceOrientationControls( cube, true );

  document.body.onkeyup = function(e){
    if(e.keyCode == 32){
      // controls.setInitialOrientation(cube.rotation.x, cube.rotation.y, cube.rotation.z);
      _initialOrientationData.x = cube.rotation.x;
      _initialOrientationData.y = cube.rotation.y;
      _initialOrientationData.z = cube.rotation.z;
    }
  }

  calibrateButton.addEventListener('click', function (e) {
    console.log('calibrating...');
    // controls.setInitialOrientation(cube.rotation.x, cube.rotation.y, cube.rotation.z);
    _initialOrientationData.x = cube.rotation.x;
    _initialOrientationData.y = cube.rotation.y;
    _initialOrientationData.z = cube.rotation.z;

    screen.orientation.lock();
    screen.lockOrientation("portrait-primary");
  });

  var animate = function () {
    requestAnimationFrame( animate );

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    if(location.hash === '#1') {
      renderer.render( scene, camera );
    } else {
      controls.update();
      // console.log('cube: \n' + JSON.stringify(cube));
      orientationData.x = cube.rotation.x - _initialOrientationData.x;
      orientationData.y = cube.rotation.y - _initialOrientationData.y;
      orientationData.z = cube.rotation.z - _initialOrientationData.z;
      console.log('orientation: \n' + JSON.stringify(orientationData));
      socket.emit('peer-msg', orientationData);
    }    
  };
  animate();

  // window.addEventListener('deviceorientation', function(e) {
  //   var gammaRotation = e.gamma ? e.gamma * (Math.PI / 600) : 0;
  //   cube.rotation.y = gammaRotation;
  // });
}

function createCamera(width, height) {

  var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  camera.position.y = 2;
  camera.position.x = 0;

  return camera;
}

function createRenderer(width, height) {

  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.physicallyCorrectLights = true;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.bias = 0.0001;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(width, height);

  return renderer;
}

function createLight() {

  var lightGeometry = new THREE.SphereGeometry(0);

  var lightMaterial = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000
  });

  var light = new THREE.PointLight(0xffffff, 1, 20, 2);
  light.power = 1700;
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.heigth = 512;
  light.shadow.radius = 1.5;

  light.add(new THREE.Mesh(lightGeometry, lightMaterial));
  light.position.set(0, 5, 3);

  return light;
}

function createHemisphereLight() {

  return new THREE.HemisphereLight(0x303F9F, 0x000000, 1);
}



socket.on('connect', function() {
  console.log('Connected to signalling server, Peer ID: %s', socket.id);
  privateButton.disabled = false;
});

socket.on('peer-msg', function (rotation) {
  if(location.hash === '#1') {
    console.log('orientation data = \n', rotation);
    // var rotation = JSON.parse(data);
    cube.rotation.x = rotation.x;
    cube.rotation.y = rotation.y;
    cube.rotation.z = rotation.z;
  } else {
    // peer.send("hello, my lord");
  }
  // var li = document.createElement('li')
  // li.appendChild(document.createTextNode(data.textVal))
  // msgList.appendChild(li)
});

socket.on('peer', function(data) { // go private
  var peerId = data.peerId;
  // var peer = new Peer({ initiator: data.initiator, trickle: useTrickle });
  var peer = new Peer({ initiator: location.hash === '#1', trickle: useTrickle });

  console.log('Peer available for connection discovered from signalling server, Peer ID: %s', peerId);

  socket.on('signal', function(data) {
    if (data.peerId == peerId) {
      console.log('Received signalling data', data, 'from Peer ID:', peerId);
      peer.signal(data.signal);
    }
  });

  peer.on('signal', function(data) {
    console.log('Advertising signalling data', data, 'to Peer ID:', peerId);
    socket.emit('signal', {
      signal: data,
      peerId: peerId
    });
  });
  peer.on('error', function(e) {
    console.log('Error sending connection to peer %s:', peerId, e);
  });
  peer.on('connect', function() {
    console.log('Peer connection established');
    goPrivate();
    if(location.hash === '#1') {
      peer.send("hi, bitch");
    } else {
      peer.send("hello, my lord");
    }
  });
  peer.on('data', function(data) {
    var string = new TextDecoder("utf-8").decode(data);
    console.log('Recieved data from peer:', string);
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(string))
    msgList.appendChild(li)
  });
  peers[peerId] = peer;
  me = peer;
});

form.addEventListener('submit', function (e, d) {
  e.preventDefault()
  var li = document.createElement('li')
  li.appendChild(document.createTextNode(box.value))
  msgList.appendChild(li)
  if (boxFile && boxFile.value !== '') {
    var reader = new window.FileReader()
    reader.onload = function (evnt) {
      socket.emit('peer-file', {file: evnt.target.result})
    }
    reader.onerror = function (err) {
      console.error('Error while reading file', err)
    }
    reader.readAsArrayBuffer(boxFile.files[0])
  } else {
    if (me) {
      me.send(box.value);
    } else {
      socket.emit('peer-msg', {textVal: box.value});
    }    
  }
  box.value = ''
  boxFile.value = ''
});

privateButton.addEventListener('click', function (e) {
  goPrivate();
  console.log('going private...');
  socket.emit('go-private', true);
});

function goPrivate () {
  upgradeMsg.innerHTML = 'WebRTC connection established!';
  privateButton.disabled = true;
}



// fullscreen
var fullscreenButton = document.getElementById('fullscreen')
fullscreenButton.addEventListener('click', function (e) {
  requestFullScreen();
});
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
