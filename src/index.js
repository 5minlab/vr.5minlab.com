var camera, scene, renderer;
var effect;
var button;
var displayMode = Modes.NORMAL;
var controls;
var stats;
var clock;

var triggers = [];

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

  var snakeVRTrigger = new Trigger(3, function() {
    setTimeout(function() {
      var url = 'https://play.google.com/store/apps/details?id=com.Fiveminlab.SnakeVR';
      console.log(`move link alternative : ${url}`);
      document.location = url;
    }, 100);
  });
  snakeVRTrigger.position.y = 0.5;
  snakeVRTrigger.position.x = 1;
  scene.add(snakeVRTrigger);
  triggers.push(snakeVRTrigger);

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

  clock = new THREE.Clock();
  clock.start();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  var delta = clock.getDelta();

  requestAnimationFrame( animate );
  if(typeof(stats) !== 'undefined') {
    stats.update();
  }
  controls.update();

  for(var i = 0 ; i < triggers.length ; i++) {
    triggers[i].update(camera, delta);
  }

  render();
}

function render() {
  var time = performance.now() * 0.0002;
  //camera.position.x = Math.cos( time ) * 4;
  //camera.position.z = Math.sin( time ) * 4;


  if(displayMode == Modes.VR) {
    effect.render( scene, camera );
  } else {
    renderer.render(scene, camera);
  }
}
