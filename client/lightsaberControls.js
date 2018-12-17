function lightsaberControls(lightsaberMesh) {
  // public properties

  // private variables
  let _orientationData = { x: 0, y: 0, z: 0 };
  let _initialOrientationData = { x: 0, y: 0, z: 0 };
  let _controls = null;
  let _lightsaberMesh = lightsaberMesh;

  // public methods
  this.orientation = orientation;
  this.setInitialOrientation = setInitialOrientation;
  this.setOrientation = setOrientation;
  this.update = update;
  
  // method definitions
  _init()
  function _init() {
    _controls = new THREE.DeviceOrientationControls( _lightsaberMesh, true );
  }

  function orientation() {
    return _orientationData;
  }

  function setInitialOrientation() {
    console.log('calibrating...');
    // controls.setInitialOrientation(cube.rotation.x, cube.rotation.y, cube.rotation.z);
    _initialOrientationData.x = _lightsaberMesh.rotation.x;
    _initialOrientationData.y = _lightsaberMesh.rotation.y;
    _initialOrientationData.z = _lightsaberMesh.rotation.z;

    screen.orientation.lock();
    screen.lockOrientation("portrait-primary");
  }

  function setOrientation(orientation) {
    _lightsaberMesh.rotation.x = orientation.x;
    _lightsaberMesh.rotation.y = orientation.y;
    _lightsaberMesh.rotation.z = orientation.z;
  }

  function update() {
    _controls.update();
    // console.log('cube: \n' + JSON.stringify(cube));
    _orientationData.x = _lightsaberMesh.rotation.x - _initialOrientationData.x;
    _orientationData.y = _lightsaberMesh.rotation.y - _initialOrientationData.y;
    _orientationData.z = _lightsaberMesh.rotation.z - _initialOrientationData.z;
    console.log('orientation: \n' + JSON.stringify(_orientationData));
    // socket.emit('peer-msg', _orientationData);
  }
  
}

module.exports = lightsaberControls;
