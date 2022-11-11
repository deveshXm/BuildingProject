import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as dat from "dat.gui";

// GUI

const gui = new dat.GUI({ width: 400 });

// GLOBALS

let raycaster = new THREE.Raycaster();
let objects = [],
  rooms = [];
let intersects = null;
let count = 6;
let flag = true,
  toggleHover = true;
let currentIntersect = null;
const parameters = {};
parameters.handleHover = function () {
  if (toggleHover) {
    for (let i = 1; i < count; i++) {
      scene.remove(objects[i]);
    }
    toggleHover = false;
  } else {
    for (let i = 1; i < count; i++) {
      scene.add(objects[i]);
    }

    toggleHover = true;
  }
};

// LOADER

const manager = new THREE.LoadingManager();

const dracoLoader = new DRACOLoader(manager);
let decoderPath = "https://www.gstatic.com/draco/v1/decoders/";
dracoLoader.setDecoderPath(decoderPath);
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

// MOUSE

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const aspect = sizes.width / sizes.height;

// canvas

const canvas = document.querySelector("canvas.webgl");

// scene

const scene = new THREE.Scene();

// camera

/* ORTHOGRAPHIC */

var camera = new THREE.OrthographicCamera(
  -7 * aspect,
  7 * aspect,
  7,
  -7,
  0.1,
  1000
);

camera.position.x = 2;
camera.position.y = 12.88;
camera.position.z = 1.127;
scene.add(camera);

// renderer

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  sizes.width = sizes.width;
  sizes.height = sizes.width;

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
renderer.setClearColor(0x2e2e2e);

// MOUSE CLICK EVENT

// lights

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
scene.add(directionalLight);
directionalLight.position.set(10, 10, -10);
directionalLight.shadowCameraTop = 20;
directionalLight.shadowCameraBottom = -10;
directionalLight.shadowCameraLeft = 20;
directionalLight.shadowCameraRight = -20;
directionalLight.castShadow = true;
const targetObject = new THREE.Object3D();
scene.add(targetObject);

// ORBIT CONTROLS

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 10;
controls.minDistance = 0;
controls.maxPolarAngle = Math.PI / 2;

/* FUNCTION CALLS */

// CSS LOADER FUNCTION

function onTransitionEnd(event) {
  const element = event.target;
  element.remove();
}

// LOADING

function resolve(gltf) {
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  var model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  rooms.push(model);
}

gltfLoader.load("/models/BUILDING/living.gltf", resolve);
gltfLoader.load("/models/BUILDING/bedroom.gltf", resolve);
gltfLoader.load("/models/BUILDING/bedroom2.gltf", resolve);
gltfLoader.load("/models/BUILDING/bathroom.gltf", resolve);
gltfLoader.load("/models/BUILDING/bathroom2.gltf", resolve);

/* ***************************************** */

// POINTS

const points = [
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

// FLOOR

function createFloor(floor) {
  for (const room of rooms) {
    floor.add(room);
  }
}

// BUILDING

function createBuilding() {
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

function changeFloorColor() {
  for (let i = 1; i < count; i++) {
    objects[i].visible = false;
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
    let idx = null;
    let p = currentIntersect.object.parent;
    while (1) {
      idx = objects.indexOf(p);
      if (idx !== null && idx !== -1) {
        break;
      }
      p = p.parent;
    }

    for (let i = 1; i <= idx; i++) {
      objects[i].visible = true;
    }

    if (idx >= 0 && idx < 6) {
      for (const model of objects[idx].children) {
        model.traverse((o) => {
          if (o.isMesh) o.material.color.set("#56887D");
        });
      }
    }
  }
}

function changeRoomColor() {
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
    let idx = null;
    if (currentIntersect) {
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

// GUI

gui.add(controls, "enabled").name("ORBIT CONTROLS");
gui.add(parameters, "handleHover").name("TOGGLE FLOOR VIEW/ROOM VIEW");

// manager function calls

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
    createBuilding();
  }
  const animate = () => {
    // updating controls
    controls.target.set(-3, 3, -0.63);
    controls.update();

    // raycaster from mouse to camera

    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

  

    if (flag && toggleHover) {
      changeFloorColor();

      for (const point of points) {
        point.element.style.display = 'none';
      }
    } else {
      changeRoomColor();
      for (const point of points) {
        const screenPosition = point.position.clone();
        screenPosition.project(camera);
        const translateX = screenPosition.x * sizes.width * 0.5;
        const translateY = -screenPosition.y * sizes.height * 0.5;
  
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
        point.element.style.display = 'block';
      }
    }

    // checking objects intersecting

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
};
