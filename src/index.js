if(typeof(require) !== 'undefined') {
  var Stats = require('three/examples/js/libs/stats.min');
  var THREE = require('three');
  var Modes = require('../lib/webvr-boilerplate/modes');
  var ButtonManager = require('../lib/webvr-boilerplate/button-manager');
  var Trigger = require('./Trigger');
  var Helper = require('./helper');
}

var camera, scene, renderer;
var cursor;
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

var updateFunctions = [];

init();
animate();

function CreateTextMesh(text, fontsize, fontcolor, bgcolor, scale) {
  // create a canvas element
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.fillStyle = bgcolor;
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.font = fontsize + "px Arial";
  context.fillStyle = fontcolor;

  var spacing = 4;

  var lines = text.split('\n');
  for(var i = 0 ; i < lines.length ; i++) {
    var line = lines[i];
    context.fillText(line, 0, (i+1) * fontsize + i*spacing);
  }

  var texture = new THREE.Texture(canvas)
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side:THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(canvas.width*scale, canvas.height*scale),
    material
  );
  return mesh;
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  window.camera = camera;
  camera.position.set(0, 3, 0);
  controls = new THREE.VRControls(camera);

  var loader = new THREE.ObjectLoader();
  loader.load('/scene.json', function(obj) {
    scene = obj;
    window.scene = scene;

    // 카메라의 z 연장선에 크로스헤어 그리기
    var geometry = new THREE.RingGeometry(0.04, 0.06, 4 );
    //var geometry = new THREE.CubeGeometry(0.3, 0.3, 0.3);
    var material = new THREE.MeshBasicMaterial({
      color: 0x61B4D7,
      side: THREE.DoubleSide
    });
    cursor = new THREE.Mesh( geometry, material );
    scene.add(cursor);


    // 폰을 들고있는 방향에 따라서 기본 방향이 달라진다
    // 기본 방향에 맞춰서 씬 자체를 돌려두기
    // 해당 방향에 맞춰서 객체를 배치하지 않으면 시작하는 순간부터
    // 반대 방향을 처다볼수 있다
    if(typeof(window.orientation) === 'undefined' || window.orientation === 0) {
      // 기본. portrait
      console.log('device orientation : portrait');
      scene.rotation.y = Math.PI/2;
      // snakevr 방향
      //scene.rotation.y = Math.PI;

    } else if(window.orientation === 90) {
      // ([display] o)
      console.log('device orientation : landscape right');

    } else if(window.orientation === -90) {
      // (o [display])
      console.log('device orientation : landscape left');
      scene.rotation.y = Math.PI;

    } else {
      // upside down
      console.log('device orientation : upside down');
      scene.rotation.y = Math.PI * 1.5;
    }

    var loader = new THREE.TextureLoader();
    loader.load('/img/Insert-hyperlink-icon.png', function(texture) {
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      });

      var snakeVRTrigger = new Trigger(2, material, function() {
        setTimeout(function() {
          var url = 'https://play.google.com/store/apps/details?id=com.Fiveminlab.SnakeVR';
          console.log(`move link alternative : ${url}`);
          document.location = url;
        }, 100);
      });

      snakeVRTrigger.position.set(-1.5, 3, 2.8);
      snakeVRTrigger.scale.set(0.5, 0.5, 0.5);
      snakeVRTrigger.rotation.y = Math.PI;
      snakeVRTrigger.forceVisible(true);
      scene.add(snakeVRTrigger);
      triggers.push(snakeVRTrigger);
    });

    loader.load('/img/next-company-logo.png', function(texture) {
      // 최적화 하려면 불투명로고로 바꾸기
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });

      // 회사 로고
      var geometry = new THREE.PlaneGeometry(1, 1);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(2.8, 4.35, -0.2);
      var scale = 0.003;
      mesh.scale.set(760*scale, 517*scale, 1);
      mesh.rotation.y = -Math.PI/2;
      scene.add(mesh);
    });

    loader.load('/img/batch-gen.png', function(texture) {
      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });

      function adjustTexcoord(geometry, minX, maxX, minY, maxY) {
        for(var i = 0 ; i < geometry.faceVertexUvs[0].length ; i++) {
          var f = geometry.faceVertexUvs[0][i];
          for(var j = 0 ; j < f.length ; j++) {
            if(f[j].x === 0) {
              f[j].x = minX;
            } else if(f[j].x === 1) {
              f[j].x = maxX;
            }
            if(f[j].y === 0) {
              f[j].y = minY;
            } else if(f[j].y === 1) {
              f[j].y = maxY;
            }
          }
        }
        geometry.uvsNeedUpdate = true;
      }

      // snake vr 설명문
      var text = 'Snake VR\n360° Snake Game';
      var textmesh = CreateTextMesh(text, 32, 'rgba(255,255,255,1)', 'rgba(0,0,0,0.5)', 0.007);
      textmesh.position.set(0, 2.8, 2.7);
      textmesh.rotation.y = Math.PI;
      scene.add(textmesh);


      // snake vr
      var snakeVRTrigger = new Trigger(2, material, null);
      adjustTexcoord(snakeVRTrigger.triggerMesh.geometry, 0.5, 1, 0.75, 1);

      snakeVRTrigger.position.set(0, 4.35, 2.8);
      snakeVRTrigger.scale.set(3.3, 1.95, 1);
      snakeVRTrigger.rotation.y = Math.PI;
      snakeVRTrigger.forceVisible(true);
      scene.add(snakeVRTrigger);
      triggers.push(snakeVRTrigger);
    });

    // sky
    loader.load('/img/blue-sky-resize.jpg', function(texture) {
      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });
      var geometry = new THREE.PlaneGeometry(30, 15);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-10, 5, 0);
      mesh.rotation.y = Math.PI/2;
      scene.add(mesh);
    });
  });

  //

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setClearColor( 0x101010 );

  function getDevicePixelRatio() {
    var ratio = window.devicePixelRatio;
    if(ratio > 2) {
      ratio = 2;
    }
    return ratio;
  }
  renderer.setPixelRatio(getDevicePixelRatio());

  renderer.setSize( window.innerWidth, window.innerHeight );
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

var initialOrientation = 0;
if(typeof(window.orientation) === 'undefined') {
  initialOrientation = 0;
} else {
  initialOrientation = window.orientation;
}

var lastTimeMsec = null;

function animate(nowMsec) {
  var delta = clock.getDelta();

  requestAnimationFrame(animate );
  if(typeof(stats) !== 'undefined') {
    stats.update();
  }
  controls.update();

  for(var i = 0 ; i < triggers.length ; i++) {
    triggers[i].update(camera, delta);
  }

  if(cursor != null) {
    var lookAtVector = new THREE.Vector3(0, 0, -1);
    lookAtVector.applyQuaternion(camera.quaternion);
    //lookAtVector.normalize();
    var v = lookAtVector.multiplyScalar(2);

    if(initialOrientation == 0) {
      // 기본. portrait
      cursor.position.set(camera.position.x-v.z , camera.position.y+v.y, camera.position.z+v.x);
    } else if(initialOrientation === 90) {
      // ([display] o)
      // landscape right
      cursor.position.set(camera.position.x+v.x, camera.position.y+v.y, camera.position.z+v.z);
    } else if(initialOrientation === -90) {
      // (o [display])
      // landscape left
      cursor.position.set(camera.position.x-v.x, camera.position.y+v.y, camera.position.z-v.z);
    }
    cursor.lookAt(camera.position);
  }

  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;

  // call each update function
  updateFunctions.forEach(function(updateFn) {
    updateFn(deltaMsec/1000, nowMsec/1000);
  })

  render();
}

function render() {
  if(displayMode == Modes.VR) {
    effect.render( scene, camera );
  } else {
    renderer.render(scene, camera);
  }
}
