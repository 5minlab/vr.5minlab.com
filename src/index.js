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

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 0);
  controls = new THREE.VRControls(camera);

  var loader = new THREE.ObjectLoader();
  loader.load('/scene.json', function(obj) {
    scene = obj

    // TODO 링크 이미지를 하나로 합칠수 있다면 DrawCall을 줄일수 있을것이다
    var loader = new THREE.TextureLoader();
    loader.load('/img/app_upper_for_vrweb.png', function(texture) {
      var triggerMaterial = new THREE.MeshBasicMaterial({
        map: texture,
      });

      var snakeVRTrigger = new Trigger(2, triggerMaterial, function() {
        setTimeout(function() {
          var url = 'https://play.google.com/store/apps/details?id=com.Fiveminlab.SnakeVR';
          console.log(`move link alternative : ${url}`);
          document.location = url;
        }, 100);
      });
      snakeVRTrigger.position.set(0, 4.35, 2.8);
      snakeVRTrigger.scale.set(3.3, 1.95, 1);
      snakeVRTrigger.rotation.y = Math.PI;
      snakeVRTrigger.forceVisible(true);
      scene.add(snakeVRTrigger);
      triggers.push(snakeVRTrigger);
    });

    loader.load('/img/box.png', function(texture) {
      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });
      var geometry = new THREE.PlaneGeometry(1, 1);
      var mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(2.8, 4.35, -0.2);
      mesh.scale.set(3.3, 1.95, 1);
      mesh.rotation.y = -Math.PI/2;
      scene.add(mesh);
    });

    // skybox
    /*
    var loader = new THREE.TextureLoader();
    loader.load('./img/skybox_texture.jpg', function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(boxWidth, boxWidth);

      var geometry = new THREE.Geometry();
      var size = 100;

      // front
      geometry.vertices.push(

      );
      var frontGeom.vertice

      // back

      // left

      // right

      // top

      // bottom


      var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      });

      var skybox = new THREE.Mesh(geometry, material);
      scene.add(skybox);
    });
    */

  });

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
  if(displayMode == Modes.VR) {
    effect.render( scene, camera );
  } else {
    renderer.render(scene, camera);
  }
}
