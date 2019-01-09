

function sceneManager(viewportContainer, width, height) {

  // public properties
  this.width = width;
  this.height = height;

  // private variables// setup 3D view
  let _viewportContainer = viewportContainer; // document.getElementById('viewport');
  let _scene = new THREE.Scene();
  let _camera = _createCamera(this.width, this.height); // new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );
  let _renderer = _createRenderer(this.width, this.height); // new THREE.WebGLRenderer();
  let _composer = new THREE.EffectComposer(_renderer);
  const settings = {
    ambientIntensity: 0.7
  };

  // public methods 
  this.addObjectToScene = addObjectToScene;
  this.render = render;
  this.getMainCamera = getMainCamera;

  // method definitions
  _init();
  function _init() {

    window.addEventListener('resize', _onWindowResize, false);

    _scene.background = new THREE.Color( 0x000000 );

    // _renderer.setSize( this.width, this.height );
    _viewportContainer.appendChild( _renderer.domElement );

    let renderScene = new THREE.RenderPass( _scene, _camera );
  
    // let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85);
    let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 3.5, 0.4, 0.85);
    bloomPass.renderToScreen = true;    

    _composer.setSize(window.innerWidth, window.innerHeight);
    _composer.addPass(renderScene);
    _composer.addPass(bloomPass);

    // lights
    // var ambientLight = new THREE.AmbientLight( 0xffffff, settings.ambientIntensity );
    // _scene.add( ambientLight );
    // var pointLight = new THREE.PointLight( 0xff0000, 0.5 );
    // pointLight.position.z = 2500;
    // _scene.add( pointLight );
    // var pointLight2 = new THREE.PointLight( 0xff6666, 1 );
    // _camera.add( pointLight2 );
    // var pointLight3 = new THREE.PointLight( 0x0000ff, 0.5 );
    // pointLight3.position.x = - 1000;
    // pointLight3.position.z = 1000;
    // _scene.add( pointLight3 );

    _scene.add( _createAmbientLight() );
    _scene.add( _createLight() );
    _scene.add( _createHemisphereLight() );
  }

  function addObjectToScene(obj) {
    _scene.add( obj );
  }

  function render() {
    // _renderer.render( _scene, _camera );

    _renderer.render( _scene, _camera );
    _composer.render();
  }

  function getMainCamera() {
    return _camera;
  }

  function _createCamera(width, height) {

    var camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
    // var camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
    camera.position.z = 0; //0.35; // back
    camera.position.y = 4; // up
    camera.position.x = 0;

    camera.up = THREE.Object3D.DefaultUp;
  
    return camera;
  }
  
  function _createRenderer(width, height) {
  
    var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.physicallyCorrectLights = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.bias = 0.0001;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = Math.pow( 1, 4.0 );
    renderer.setPixelRatio( window.devicePixelRatio );

    renderer.setSize(width, height);
  
    return renderer;
  }

  function _createAmbientLight() {
    var ambientLight = new THREE.AmbientLight( 0xffffff, settings.ambientIntensity );
    return ambientLight;
  }
  
  function _createLight() {
  
    var lightGeometry = new THREE.SphereGeometry(0);
  
    var lightMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
  
    var light = new THREE.PointLight(0xffffff, 1, 20, 2); // 1, 20, 2
    light.power = 1700 * 10;
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.heigth = 512;
    light.shadow.radius = 1.5;
  
    light.add(new THREE.Mesh(lightGeometry, lightMaterial));
    light.position.set(0, 10, 6);
  
    return light;
  }
  
  function _createHemisphereLight() {
    return new THREE.HemisphereLight(0x303F9F, 0x000000, 1);
  }

  function _onWindowResize() {
    //resize & align
    var sceneHeight = window.innerHeight;
    var sceneWidth = window.innerWidth;
    _renderer.setSize(sceneWidth, sceneHeight);
    _camera.aspect = sceneWidth/sceneHeight;
    _camera.updateProjectionMatrix();
  }
}

module.exports = sceneManager;
