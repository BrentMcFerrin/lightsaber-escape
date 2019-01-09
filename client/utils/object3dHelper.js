const Object3dHelper = {
  getWorldDirection(mesh) {

    // // using Matrix
    // let rotationMatrix = new THREE.Matrix4();
    // rotationMatrix.extractRotation( mesh.matrix );

    // let direction = new THREE.Vector3( 0, 0, 1 );
    // direction = direction.applyMatrix4( rotationMatrix ); // old way: rotationMatrix.multiplyVector3( direction );
    
    // using Quaternion
    var direction = new Vector3( 0, 0, -1 ).applyQuaternion( mesh.quaternion );

    return direction;
  }
}

module.exports = Object3dHelper;
