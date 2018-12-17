function meshProvider() {

  // public properties

  // private variables

  // public methods
  this.getLightsaber = getLightsaber;
  
  // method definitions
  function getLightsaber() {
    // 3d
    let geometry = new THREE.BoxGeometry( 0.25, 5, 0.25 );
    geometry.translate(0, 2, 0);
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    let lightsaber = new THREE.Mesh( geometry, material );

    return lightsaber;
  }
}

module.exports = meshProvider;
