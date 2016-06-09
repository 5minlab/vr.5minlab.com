function Trigger(delay, triggerMaterial, callback) {
  THREE.Object3D.call(this);
  this.type = 'Trigger';
  this.delay = delay;
  this.curr = 0;
  this.fired = false;
  this.callback = callback;

  var material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    opacity: 0.5,
    transparent: true,
  });

  //var debugMaterial = new THREE.MeshBasicMaterial({
  //  color: 0x0000ff,
  //  wireframe: true,
  //});

  this.visibleGeometry = new THREE.PlaneGeometry(1, 1);
  this.value(0);
  this.visibleMesh = new THREE.Mesh(this.visibleGeometry, material);
  this.visibleMesh.position.z = 0.01;

  this.add(this.visibleMesh);

  //this.triggerGeometry = new THREE.CubeGeometry(1, 1, 1);
  this.triggerGeometry = new THREE.PlaneGeometry(1, 1);
  this.triggerMesh = new THREE.Mesh(this.triggerGeometry, triggerMaterial);
  this.triggerMesh.visible = false;
  this.add(this.triggerMesh);

  this.raycaster = new THREE.Raycaster();
}

Trigger.prototype = Object.create(THREE.Object3D.prototype);
Trigger.prototype.constructor = Trigger;

Trigger.prototype.update = function(camera, delta) {
  if(!this.callback) { return; }

  var raycaster = this.raycaster;

  raycaster.set(camera.position, camera.getWorldDirection());
  raycaster.near = 0.1;
  raycaster.far = 10;

  // mesh가 visible이 아니면 raycast가 안돌아가더라. 그래서 잠깐동안 상태 변경
  var mesh = this.triggerMesh;
  var prev = mesh.visible;
  mesh.visible = true;
  var intersects = raycaster.intersectObjects([mesh]);
  if(intersects.length === 0) {
    this.curr = 0;
    this.value(0);

  } else {
    this.curr += delta;
    if(this.curr > this.delay) {
      this.curr = this.delay;
    }
    var val = this.curr / this.delay;
    this.value(val);
  }
  mesh.visible = prev;
}

Trigger.prototype.value = function(val) {
  var geometry = this.visibleGeometry;
  geometry.vertices[0].y = val - 0.5;
  geometry.vertices[1].y = val - 0.5;
  geometry.verticesNeedUpdate = true;

  if(this.curr === this.delay && this.fired == false) {
    this.fired = true;
    this.callback();
  }
}

Trigger.prototype.forceVisible = function(v) {
  this.triggerMesh.visible = v
}

if(typeof(module) !== 'undefined') {
  module.exports = Trigger;
}
