import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// GLOBALS

let raycaster = new THREE.Raycaster();
let objects = [];
let intersects = null;
let count = 6;
let flag = true;
let currentIntersect = null;

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// canvas

const canvas = document.querySelector("canvas.webgl");

// scene

const scene = new THREE.Scene();

// camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(2, 2, 2);

// renderer

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerWidth;

  // update camera

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// renderer

renderer.setSize(sizes.width, sizes.height);

camera.position.set(3, 3, 3);

// orbit controls

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// lights

const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
scene.add(directionalLight);
directionalLight.position.set(2, 2, 0);

const ambientLight = new THREE.AmbientLight("#00ffff", 0.5);
scene.add(ambientLight);

/* ***************************************** */

// FLOOR

const floorCubeGeometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);

function createFloor(floor) {
  const floorCubeMaterial = new THREE.MeshStandardMaterial({
    color: "white",
    transparent: true,
    opacity: 0.5,
  });
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const floorCube = new THREE.Mesh(floorCubeGeometry, floorCubeMaterial);
      floorCube.position.x = 0.5 * i;
      floorCube.position.z = 0.5 * j;
      floor.add(floorCube);
    }
  }
}

function createBuilding() {
  let height = 0;

  // BUILDING

  for (let currFloor = 0; currFloor < count; currFloor++, height += 0.5) {
    const floor = new THREE.Group();
    createFloor(floor);
    floor.position.y = height;
    scene.add(floor);
    objects.push(floor);
  }
}

// BUILDING MOUSE EVENTS

function changeFloorColor() {
  for (let i = 1; i < count; i++) {
    objects[i].visible = false;
  }

  for (const object of objects) {
    for (const children of object.children) {
      children.material.color.set("#ffffff");
    }
  }

  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }

  // remove scene & create new

  if (currentIntersect !== null) {
    let idx = 0;
    if (currentIntersect) {
      idx = objects.indexOf(currentIntersect.object.parent);

      // changing visibility of floor

      for (let i = 1; i <= idx; i++) {
        objects[i].visible = true;
      }

      // chaning color of floor
      if (objects[idx] !== undefined) {
        for (const children of objects[idx].children) {
          children.material.color.set("#A83D3D");
        }
      }
    }
  }
}

window.addEventListener("click", () => {
  if (flag) {
    if (currentIntersect !== null) {
      deleteGroup();
    }
    camera.position.set(2, 2, 2);
    changeToFloorView();
    flag = false;
  } else {
    if (currentIntersect !== null) {
      deleteGroup();
    }
    camera.position.set(3, 3, 3);
    createBuilding();
    flag = true;
  }
});

// FLOOR MOUSE EVENTS

function changeToFloorView() {
  const floor = new THREE.Group();
  createFloor(floor);
  objects.push(floor);
  scene.add(floor);
}

// DELETE ENTITY

function deleteGroup() {
  for (const group of objects) {
      scene.remove(group);
  }

  objects = [];
}

// function calls

if (flag) {
  createBuilding();
}

/* ************************************************************ */

// animate fucntion

const animate = () => {
  controls.update();

  // raycaster from mouse to camera

  raycaster.setFromCamera(mouse, camera);

  // checking objects intersecting
  intersects = raycaster.intersectObjects(scene.children, true);

  // changing color and visibility

  if (flag) {
    changeFloorColor();
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
