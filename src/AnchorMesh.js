function AnchorMesh(geometry, material, hrefs) {
  THREE.Mesh.call(this, geometry, material);
  this.type = 'AnchorMesh';
  this.hrefs = hrefs;

  this.triggered = false;
}

AnchorMesh.prototype = Object.create(THREE.Mesh.prototype);
AnchorMesh.prototype.constructor = AnchorMesh;

AnchorMesh.prototype.moveLink = function() {
  if(!this.triggered) {
    this.triggered = true;

    let href1 = this.hrefs[0];
    let href2 = this.hrefs[1];

    document.location = href1;
    console.log(`move link : ${href1}`);

    setTimeout(function() {
      console.log(`move link alternative : ${href2}`);
      document.location = href2;
    }, 100);
  }
}
