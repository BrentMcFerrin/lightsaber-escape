

function meshProvider(autoLoad) {

  // public properties

  // private variables
  const _objLoader = new THREE.OBJLoader();

  let _lightsaber = null;

  let settings = {
    metalness: 1.0,
    roughness: 0.4,
    ambientIntensity: 0.2,
    aoMapIntensity: 1.0,
    envMapIntensity: 1.0,
    displacementScale: 2.436143, // from original model
    normalScale: 1.0
  };

  // public methods
  this.getDummyModel = getDummyModel;
  this.getLightsaber = getLightsaber;
  
  // method definitions
  _init();
  function _init() {
    if (autoLoad) {
      _loadLightsaberModel();
    }
  }

  function getDummyModel() {
    // 3d
    let geometry = new THREE.BoxGeometry( 0.25, 5, 0.25 );
    geometry.translate(0, 2, 0);
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    let lightsaber = new THREE.Mesh( geometry, material );
    return lightsaber;
  }

  function getLightsaber(onLoaded) {
    // 3d
    // let geometry = new THREE.BoxGeometry( 0.25, 5, 0.25 );
    // geometry.translate(0, 2, 0);
    // let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // let lightsaber = new THREE.Mesh( geometry, material );
    // return lightsaber;

    return _lightsaber;
  }

  function _loadLightsaberModel() {

    // textures
    var textureLoader = new THREE.TextureLoader();
    var albedo = textureLoader.load( 'content/models/lightsaber/texture/diffuse_color.png' );
    var normalMap = textureLoader.load( 'content/models/lightsaber/texture/normal.png' );
    var metalMap = textureLoader.load( 'content/models/lightsaber/texture/specular_color.png' );
    var roughnessMap = textureLoader.load( 'content/models/lightsaber/texture/roughness.png' );
    var emissionMap = textureLoader.load( 'content/models/lightsaber/texture/emission.png' );
    // var aoMap = textureLoader.load( 'content/models/lightsaber/texture/diffuse_color.png' );
    // var displacementMap = textureLoader.load( 'content/models/lightsaber/texture/diffuse_color.png' );

    // material
    // const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); // for bloom
    const material = new THREE.MeshStandardMaterial( {
      map: albedo,
      roughnessMap: roughnessMap,
      metalnessMap: metalMap,
      normalMap: normalMap,
      emissive: new THREE.Color( 0xffffff ),
      // emissive: new THREE.Color( 0x00bfff ),
      emissiveMap: emissionMap,
      emissiveIntensity: 1000,

      // aoMap: aoMap,
      // color: 0x888888,
      roughness: 1.0, // settings.roughness,
      metalness: 1.0, // settings.metalness,
      // normalMap: normalMap,
      normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?      
      aoMapIntensity: 1,
      // displacementMap: displacementMap,
      // displacementScale: settings.displacementScale,
      // displacementBias: - 0.428408, // from original model
      // envMap: reflectionCube,
      envMapIntensity: settings.envMapIntensity,
      side: THREE.DoubleSide,

      shading: THREE.SmoothShading
    } );

    _objLoader.load(
      // resource URL
      'content/models/lightsaber/lightsaber.obj',
      // called when resource is loaded
      function ( object ) {    
        // scene.add( object );
        // object.scale.set(0.1, 0.1, 0.1);
        // _lightsaber = object;
        // onLoaded(object);

        var geometry = object.children[ 0 ].geometry;
        _lightsaber = new THREE.Mesh( geometry, material );
        _lightsaber.scale.multiplyScalar( 0.1 );
      },
      // called when loading is in progresses
      function ( xhr ) {    
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );    
      },
      // called when loading has errors
      function ( error ) {    
        console.log( 'An error happened' );    
      }
    );
  }
}

module.exports = meshProvider;
