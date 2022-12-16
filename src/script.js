import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

let planeUUID = null;

function onTransitionEnd(event) {
  const element = event.target;
  element.remove();
}

// GLOBALS

let idx = null;
let intersects = null;
let currentIntersect = null;
let raycaster = new THREE.Raycaster();
let camera, scene, manager, mouse, renderer, points, sizes, controls;


const model1 = {
  count: 6,
  rooms: [],
  objects: []
}

const model2 = {
  count: 6,
  rooms: [],
  objects:[]
}

// CURRENT MODEL GLOBALS

let currentCount = model1.count;
let currentRooms = model1.rooms;
let currentObjects = model1.objects;

// BUTTON FLAGS AND TOGGLES

let flag = true;
let toggleHover = true;
let toggleRoom = false;


function init() {
  // LOADER

  manager = new THREE.LoadingManager();

  // MOUSE

  mouse = new THREE.Vector2();
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
  });

  sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // canvas

  const canvas = document.querySelector("canvas.webgl");

  // scene

  scene = new THREE.Scene();

  // camera

  camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 1, 1000);
  camera.position.set(-12, 12, -7);
  scene.add(camera);

  // renderer

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // update camera

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // update renderer

    renderer.setSize(sizes.width, sizes.height);
  });

  // renderer

  renderer.setSize(sizes.width, sizes.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor("#87CEEB");

  // MOUSE CLICK EVENT

  // lights

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  scene.add(directionalLight);
  directionalLight.position.set(10, 10, -10);
  directionalLight.shadowCameraTop = 20;
  directionalLight.shadowCameraBottom = -10;
  directionalLight.shadowCameraLeft = 20;
  directionalLight.shadowCameraRight = -20;
  directionalLight.castShadow = true;

  // ORBIT CONTROLS

  controls = new OrbitControls(camera, canvas);
  controls.maxDistance = 30;
  controls.minDistance = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target = new THREE.Vector3(-2, 0, 1);
  controls.enabled = true;
  controls.enablePan = true;

  // LOADING
}

init();

// loading Models

function loadModels() {
  const dracoLoader = new DRACOLoader(manager);
  let decoderPath = "https://www.gstatic.com/draco/v1/decoders/";
  dracoLoader.setDecoderPath(decoderPath);
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.setDRACOLoader(dracoLoader);

  function resolve(gltf) {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    (model1.rooms).push(model);
  }

  gltfLoader.load("/models/BUILDING/living.gltf", resolve);
  gltfLoader.load("/models/BUILDING/bedroom.gltf", resolve);
  gltfLoader.load("/models/BUILDING/bedroom2.gltf", resolve);
  gltfLoader.load("/models/BUILDING/bathroom.gltf", resolve);
  gltfLoader.load("/models/BUILDING/bathroom2.gltf", resolve);
}

loadModels();

function controlButtons(objects) {
  let btn1 = false;
  let btn2 = false;
  let btn3 = false;
  let defaultPath1 = [];
  let defaultPath2 = [];
  let defaultPath3 = [];

  let defaultRect1 = [];
  let defaultRect2 = [];
  let defaultRect3 = [];

  document.getElementById("btn1").addEventListener("click", (event) => {
    if (toggleRoom) {
      event.preventDefault();
    } else {
      if (toggleHover) {
        for (let i = 1; i < objects.length; i++) {
          scene.remove(objects[i]);
        }
        toggleHover = false;
      } else {
        for (let i = 1; i < objects.length; i++) {
          scene.add(objects[i]);
        }

        toggleHover = true;
      }
      if (toggleHover) {
        camera.zoom = 1;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      } else {
        camera.zoom = 3;
        camera.lookAt(-3.8, 0.5, -1.2);
        camera.updateProjectionMatrix();
      }
      let rect = document.getElementById("btn1").getElementsByTagName("rect");
      let path = document.getElementById("btn1").getElementsByTagName("path");

      if (!btn1) {
        for (let i = 0; i < rect.length; i++) {
          defaultRect1.push(rect[i].getAttribute("fill"));
          rect[i].setAttribute("fill", "#8B0000");
        }
        for (let i = 0; i < path.length; i++) {
          defaultPath1.push(path[i].getAttribute("fill"));
          path[i].setAttribute("fill", "white");
        }
        btn1 = true;
      } else {
        for (let i = 0; i < rect.length; i++) {
          rect[i].setAttribute("fill", defaultRect1[i]);
        }
        for (let i = 0; i < path.length; i++) {
          path[i].setAttribute("fill", defaultPath1[i]);
        }
        btn1 = false;
        defaultPath1 = [];
        defaultRect1 = [];
      }
    }
  });
  document.getElementById("btn2").addEventListener("click", () => {
    controls.enableRotate = !controls.enableRotate;
    let rect = document.getElementById("btn2").getElementsByTagName("rect");
    let path = document.getElementById("btn2").getElementsByTagName("path");

    if (!btn2) {
      for (let i = 0; i < rect.length; i++) {
        defaultRect2.push(rect[i].getAttribute("fill"));
        rect[i].setAttribute("fill", "#8B0000");
      }
      for (let i = 0; i < path.length; i++) {
        defaultPath2.push(path[i].getAttribute("fill"));
        path[i].setAttribute("fill", "white");
      }
      btn2 = true;
    } else {
      for (let i = 0; i < rect.length; i++) {
        rect[i].setAttribute("fill", defaultRect2[i]);
      }
      for (let i = 0; i < path.length; i++) {
        path[i].setAttribute("fill", defaultPath2[i]);
      }
      btn2 = false;
      defaultPath2 = [];
      defaultRect2 = [];
    }
  });
  document.getElementById("btn3").addEventListener("click", () => {
    controls.enablePan = !controls.enablePan;
    let rect = document.getElementById("btn3").getElementsByTagName("rect");
    let path = document.getElementById("btn3").getElementsByTagName("path");

    if (!btn3) {
      for (let i = 0; i < rect.length; i++) {
        defaultRect3.push(rect[i].getAttribute("fill"));
        rect[i].setAttribute("fill", "#8B0000");
      }
      for (let i = 0; i < path.length; i++) {
        defaultPath3.push(path[i].getAttribute("fill"));
        path[i].setAttribute("fill", "white");
      }
      btn3 = true;
    } else {
      for (let i = 0; i < rect.length; i++) {
        rect[i].setAttribute("fill", defaultRect3[i]);
      }
      for (let i = 0; i < path.length; i++) {
        path[i].setAttribute("fill", defaultPath3[i]);
      }
      btn3 = false;
      defaultPath3 = [];
      defaultRect3 = [];
    }
  });

  document.addEventListener("dblclick", () => {
    if (!toggleRoom) {
      if (idx !== null && idx >= 0) {
        scene.remove(objects[0]);
        scene.add((model1.rooms)[idx]);
        toggleRoom = true;
      }
    } else {
      scene.add(objects[0]);
      scene.remove((model1.rooms)[idx]);
      toggleRoom = false;
    }
  });

  /* ***************************************** */

  // POINTS

  points = [
    {
      position: new THREE.Vector3(-4, 0.5, 0),
      element: document.querySelector(".point-0"),
    },
    {
      position: new THREE.Vector3(-5.5, 0.5, -2.5),
      element: document.querySelector(".point-1"),
    },
    {
      position: new THREE.Vector3(-3.8, 0.5, -2.5),
      element: document.querySelector(".point-2"),
    },
    {
      position: new THREE.Vector3(-2.5, 0.5, -2.5),
      element: document.querySelector(".point-3"),
    },
    {
      position: new THREE.Vector3(-1.5, 0.5, -2.5),
      element: document.querySelector(".point-4"),
    },
  ];
}

controlButtons(currentObjects);

// GROUND

function ground() {

  var textureLoader = new THREE.TextureLoader();

  const grassColorTexture = textureLoader.load("/textures/grass/color.jpg");
  const grassAmbientOcclusionTexture = textureLoader.load(
    "/textures/grass/ambientOcclusion.jpg"
  );
  const grassHeightTexture = textureLoader.load("/textures/grass/height.png");
  const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
  const grassRoughnessTexture = textureLoader.load(
    "/textures/grass/roughness.jpg"
  );

  grassColorTexture.repeat.set(1000, 1000);
  grassAmbientOcclusionTexture.repeat.set(1000, 1000);
  grassNormalTexture.repeat.set(1000, 1000);
  grassHeightTexture.repeat.set(1000, 1000);
  grassRoughnessTexture.repeat.set(1000, 1000);

  grassColorTexture.wrapS = THREE.RepeatWrapping;
  grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
  grassHeightTexture.wrapS = THREE.RepeatWrapping;
  grassNormalTexture.wrapS = THREE.RepeatWrapping;
  grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

  grassColorTexture.wrapT = THREE.RepeatWrapping;
  grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
  grassHeightTexture.wrapT = THREE.RepeatWrapping;
  grassNormalTexture.wrapT = THREE.RepeatWrapping;
  grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
      map: grassColorTexture,
      metalness: 0,
      transparent: true,
      aoMap: grassAmbientOcclusionTexture,
      displacementMap: grassHeightTexture,
      roughnessMap: grassRoughnessTexture,
      normalMap: grassNormalTexture,
      displacementScale: 0.1,
    })
  );

  plane.receiveShadow = true;

  plane.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(plane.geometry.attributes.uv.array, 2)
  );

  plane.rotation.x = -Math.PI * 0.5;
  plane.position.y = -0.2;
  planeUUID = plane.uuid;
  scene.add(plane);
}

ground();

function createFloor(floor) {
  for (const room of model1.rooms) {
    floor.add(room);
  }
}

// BUILDING

function createBuilding(count ,objects) {
  let height = -0.1;
  const floor = new THREE.Group();
  floor.castShadow = true;
  createFloor(floor);
  for (let currFloor = 0; currFloor < count; currFloor++, height += 1.7) {
    const fl = floor.clone();
    fl.position.set(0, height, 0);
    scene.add(fl);
    objects.push(fl);
  }
}

// INTERACTION FUNCTIONS

function changeFloorColor(objects) {
  for (let i = 0; i < objects.length; i++) {
    objects[i].visible = true;
  }

  for (const floor of objects) {
    for (const model of floor.children) {
      model.traverse((o) => {
        if (o.isMesh) {
          o.material.color.set("white");
        }
      });
    }
  }

  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }
  if (currentIntersect && currentIntersect !== null) {
    if (currentIntersect.object.uuid !== planeUUID) {
      let idx = null;
      let p = currentIntersect.object.parent;
      while (1) {
        idx = objects.indexOf(p);
        if (idx !== null && idx !== -1) {
          break;
        }
        p = p.parent;
      }

      let i = 1;
      if (idx > 0) {
        i = idx;
      }
      for (i; i < objects.length; i++) {
        objects[i].visible = false;
      }

      if (idx >= 0 && idx < 6) {
        for (const model of objects[idx].children) {
          model.traverse((o) => {
            if (o.isMesh) o.material.color.set("#C6E2FF");
          });
        }
      }
    }
  }
}

function changeRoomColor(rooms, objects) {
  idx = null;
  for (const floor of objects) {
    for (const model of floor.children) {
      model.traverse((o) => {
        if (o.isMesh) o.material.color.set("white");
      });
    }
  }

  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }

  if (currentIntersect && currentIntersect !== null) {
    if (currentIntersect.object.uuid !== planeUUID) {
      let p = currentIntersect.object.parent;
      while (1) {
        idx = objects[0].children.indexOf(p);
        if (idx !== null && idx !== -1) {
          break;
        }
        p = p.parent;
      }

      // traversing floor and changing color of floor

      if (rooms[idx] && rooms[idx] !== null) {
        for (const model of rooms[idx].children) {
          model.traverse((o) => {
            if (o.isMesh) o.material.color.set("#C6E2FF");
          });
        }
      }
    }
  }
}

// ANIMATE

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const loadingScreen = document.getElementById("count");
  loadingScreen.innerHTML = Math.floor((itemsLoaded / itemsTotal) * 100) + "%";
};

manager.onLoad = () => {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");

  // optional: remove loader from DOM via event listener
  loadingScreen.addEventListener("transitionend", onTransitionEnd);

  if (flag) {
    createBuilding(currentCount ,currentObjects);
  }
  const animate = () => {
    // updating controls

    // raycaster from mouse to camera

    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    if (flag && toggleHover) {
      changeFloorColor(currentObjects);

      for (const point of points) {
        point.element.style.display = "none";
      }
    } else {
      if (toggleRoom) {
        for (const point of points) {
          point.element.style.display = "none";
        }
      } else {
        changeRoomColor(currentRooms, currentObjects);
        for (const point of points) {
          const screenPosition = point.position.clone();
          screenPosition.project(camera);
          const translateX = screenPosition.x * sizes.width * 0.5;
          const translateY = -screenPosition.y * sizes.height * 0.5;

          point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
          point.element.style.display = "block";
        }
      }
    }

    console.log();
    // checking objects intersecting

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
};
