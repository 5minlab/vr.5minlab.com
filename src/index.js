var camera, scene, renderer;
var effect;
var button;
var displayMode = Modes.NORMAL;
var controls;
var stats;

var raycaster = new THREE.Raycaster();

function fillGeometryVertexColors(geometry, color) {
  const faceIndices = [ 'a', 'b', 'c' ];
  for(let i = 0 ; i < geometry.faces.length ; i++) {
    let f = geometry.faces[i];
    for(let j = 0 ; j < 3 ; j++) {
      let vertexIndex = f[ faceIndices[ j ] ];
      let p = geometry.vertices[ vertexIndex ];
      f.vertexColors[ j ] = color;
    }
  }
}

init();
animate();

function init() {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 3, 2, 3 );
  camera.focalLength = camera.position.distanceTo( scene.position );
  camera.lookAt( scene.position );
  controls = new THREE.VRControls(camera);

  // Add a repeating grid as a skybox - for debug
  var boxWidth = 5;
  var loader = new THREE.TextureLoader();
  loader.load('./img/box.png', onTextureLoaded);
  function onTextureLoaded(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(boxWidth, boxWidth);
    var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0x01BE00,
      side: THREE.BackSide
    });
    var skybox = new THREE.Mesh(geometry, material);
    scene.add(skybox);
  }

  var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
  });

  var geometry = new THREE.TorusKnotGeometry( 0.4, 0.15, 150, 20 );;
  fillGeometryVertexColors(geometry, new THREE.Color(0xff0000));
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.y = 0.75;
  scene.add( mesh );

  var geometry = new THREE.BoxGeometry( 3, 0.1, 3 );
  fillGeometryVertexColors(geometry, new THREE.Color(0x00ff00));

  // intent/playstore 즉시 띄우는건 자바스크립트로는 안되는듯. 권한 문제로 추정
  var mesh = new AnchorMesh(geometry, material, [
    'market://details?id=com.Fiveminlab.SnakeVR',
    'https://play.google.com/store/apps/details?id=com.Fiveminlab.SnakeVR',
  ]);
  mesh.position.y = - 0.1;
  scene.add( mesh );

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( - 1, 1.5, 0.5 );
  scene.add( light );

  //

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setClearColor( 0x101010 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  //

  effect = new THREE.CardboardEffect( renderer );
  effect.setSize( window.innerWidth, window.innerHeight );

  //

  window.addEventListener( 'resize', onWindowResize, false );

  // stats for debug
  var isDev = window.location.href.indexOf("?dev")  > -1;
  if(isDev) {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';
    document.getElementById('container').appendChild(stats.domElement);
  }


  // fullscreen and extra buttons
  button = new ButtonManager();
  button.on('fs', function() {
    Helper.fullscreenRequest(document.body);
    Helper.enableWakelock();

    displayMode = Modes.MAGIC_WINDOW;
    button.setMode(displayMode, true);
  });
  button.on('vr', function() {
    Helper.fullscreenRequest(document.body);
    Helper.enableWakelock();

    displayMode = Modes.VR;
    button.setMode(displayMode, true);
  });
  button.on('back', function() {
    Helper.fullscreenExit();
    Helper.disableWakelock();
  });
  button.on('settings', function() {
  });

  function onFullscreenChange(evt, a, b) {
    if(Helper.fullscreenStatus() == false) {
      // exit vr
      // 기기의 back button을 이용해서 전체화면 빠져나오는 경우를 처리하는게 목적
      displayMode = Modes.NORMAL;
      button.setMode(displayMode, true);
    }
  }
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  document.addEventListener('mozfullscreenchange', onFullscreenChange);
  document.addEventListener('MSFullscreenChange', onFullscreenChange);
  window.addEventListener('orientationchange', onFullscreenChange);

  // default mode
  button.setMode(displayMode, true);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );

}

var counter = 0;

function checkRaycast() {
  // 처다보는 방향으로 raycast
  raycaster.set(camera.position, camera.getWorldDirection());
  raycaster.near = 0.1;
  raycaster.far = 10;

  var found = false;
  var intersects = raycaster.intersectObjects(scene.children);
  for(var i = 0 ; i < intersects.length ; i++) {
    if(intersects[i].object.type === 'AnchorMesh') {
      found = true;
      counter += 1;
      if(counter > 50) {
        intersects[i].object.moveLink();
      }
    }
  }

  if(found == false) {
    counter = 0;
  }

}

function animate() {
  requestAnimationFrame( animate );
  if(typeof(stats) !== 'undefined') {
    stats.update();
  }
  controls.update();

  checkRaycast();

  render();
}

function render() {

  var time = performance.now() * 0.0002;
  //camera.position.x = Math.cos( time ) * 4;
  //camera.position.z = Math.sin( time ) * 4;

  var mesh = scene.children[ 0 ];
  mesh.rotation.x = time * 2;
  mesh.rotation.y = time * 5;

  if(displayMode == Modes.VR) {
    effect.render( scene, camera );
  } else {
    renderer.render(scene, camera);
  }
}
