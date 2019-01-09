const Dispatcher = require('./utils/dispatcher');
const Object3dHelper = require('./utils/object3dHelper');

function keyboardControls(object, config) {
  // public properties
  let obj = object;

  // private variables  
  let _keyboard = {};
  const _dispatcher = new Dispatcher();
  let _config = Object.assign({},
    {
      speed: 0.2,
      turnSpeed: Math.PI * 0.02,
      playerHeight: 4
    },
    config);

  const _keyboardKeys = {
    W: 87,
    S: 83,
    A: 65,
    D: 68,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39
  };

  // public methods
  // this.addListener = addListener;
  // this.removeListener = removeListener;
  this.update = update;

  // method definitions
  _init();

  function _init() {
    // testing for camera
    obj.lookAt(new THREE.Vector3(0, _config.playerHeight, 0));
    
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
  }

  // function addListener(eventName, callback) {
  //   _dispatcher.on(eventName, callback);
  // }

  // function removeListener(eventName, callback) {
  //   _dispatcher.off(eventName, callback);
  // }

  function keyDown(event) {
    _keyboard[event.keyCode] = true;
  }

  function keyUp(event) {
    _keyboard[event.keyCode] = false;
  }

  function update() {
    // keyboard movement inputs
    if (_keyboard[_keyboardKeys.W]) { // W key = 87
      obj.translateZ(-_config.speed);
    }
    if (_keyboard[_keyboardKeys.S]) { // S key = 83
      obj.translateZ(_config.speed);
    }
    if (_keyboard[_keyboardKeys.A]) { // A key = 65
      obj.translateX(-_config.speed);
    }
    if (_keyboard[_keyboardKeys.D]) { // D key = 68
      obj.translateX(_config.speed);
    }

    // keyboard turn inputs
    if (_keyboard[_keyboardKeys.ARROW_LEFT]) { // left arrow key = 37
      obj.rotation.y += _config.turnSpeed;
    }
    if (_keyboard[_keyboardKeys.ARROW_RIGHT]) { // right arrow key = 39
      obj.rotation.y -= _config.turnSpeed;
    }
  }
}

module.exports = keyboardControls;
