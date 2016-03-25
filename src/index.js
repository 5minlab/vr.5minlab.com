var camera, scene, renderer;
var effect;
var button;
var displayMode = Modes.NORMAL;

init();
animate();

function init() {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 3, 2, 3 );
  camera.focalLength = camera.position.distanceTo( scene.position );
  camera.lookAt( scene.position );

  var geometry = new THREE.TorusKnotGeometry( 0.4, 0.15, 150, 20 );;
  var material = new THREE.MeshStandardMaterial( { roughness: 0.01, metalness: 0.2 } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.y = 0.75;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  var geometry = new THREE.BoxGeometry( 3, 0.1, 3 );
  var material = new THREE.MeshStandardMaterial( { roughness: 1.0, metalness: 0.0 } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.y = - 0.1;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  var light = new THREE.DirectionalLight( 0x8800ff );
  light.position.set( - 1, 1.5, 0.5 );
  light.castShadow = true;
  light.shadow.camera.zoom = 4;
  scene.add( light );

  var light = new THREE.DirectionalLight( 0xff0000 );
  light.position.set( 1, 1.5, - 0.5 );
  light.castShadow = true;
  light.shadow.camera.zoom = 4;
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

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {

  var time = performance.now() * 0.0002;
  camera.position.x = Math.cos( time ) * 4;
  camera.position.z = Math.sin( time ) * 4;
  camera.lookAt( new THREE.Vector3() );

  var mesh = scene.children[ 0 ];
  mesh.rotation.x = time * 2;
  mesh.rotation.y = time * 5;

  if(displayMode == Modes.VR) {
    effect.render( scene, camera );
  } else {
    renderer.render(scene, camera);
  }
}
