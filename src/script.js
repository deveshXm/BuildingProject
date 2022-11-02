import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

// axesHelper

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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

const clock = new THREE.Clock();

// renderer

renderer.setSize(sizes.width, sizes.height);

camera.position.set(5, 5, 5);

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

// Intersction hover effect

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -((event.clientY / sizes.height) * 2 - 1);
});

var raycaster = new THREE.Raycaster();
var objects = [];

// Building

// floor

const floorGeometry = new THREE.BoxBufferGeometry(2, 0.5, 2);

let count = 10;
let height = 0;

for (let i = 0; i < count; i++, height += 0.5) {
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "white" });
  floorMaterial.transparent = true;
  floorMaterial.opacity = 0.5;
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = height;
  objects.push(floor);
  scene.add(floor);
}
console.log(objects);

// hiding all floors except first one



let currentIntersect = null;



const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);

  for(let i = 1 ; i < count ; i++){
    objects[i].visible = false;
  }

  for (const object of objects) {
    object.material.color.set("#ffffff");
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      console.log("mouse enter");
    }
    currentIntersect = intersects[0];
    currentIntersect.object.material.color.set("#0000ff");
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }
    currentIntersect = null;
  }

  if(currentIntersect !== null){
    let idx = objects.indexOf(currentIntersect.object);
    for(let i = 1 ; i <=idx ; i++){
      objects[i].visible = true;
      objects.update = true;
    }
    console.log(idx);
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
