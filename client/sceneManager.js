

function sceneManager(viewportContainer, width, height) {

  // public properties
  this.width = width;
  this.height = height;

  // private variables// setup 3D view
  let _viewportContainer = viewportContainer; // document.getElementById('viewport');
  let _scene = new THREE.Scene();
  let _camera = _createCamera(this.width, this.height); // new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
  let _renderer = _createRenderer(this.width, this.height); // new THREE.WebGLRenderer();  

  // public methods 
  this.addObjectToScene = addObjectToScene;
  this.render = render;

  // method definitions
  _init();
  function _init() {
    // _renderer.setSize( this.width, this.height );
    _viewportContainer.appendChild( _renderer.domElement );
    _scene.add( _createLight() );
    _scene.add( _createHemisphereLight() );
  }

  function addObjectToScene(obj) {
    _scene.add( obj );
  }

  function render() {
    _renderer.render( _scene, _camera );
  }

  function _createCamera(width, height) {

    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;
    camera.position.x = 0;
  
    return camera;
  }
  
  function _createRenderer(width, height) {
  
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
  
  function _createLight() {
  
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
  
  function _createHemisphereLight() {
    return new THREE.HemisphereLight(0x303F9F, 0x000000, 1);
  }
}

module.exports = sceneManager;
