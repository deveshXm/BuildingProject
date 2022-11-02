import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import { AnimationActionLoopStyles } from "three";

// canvas

const canvas = document.querySelector("canvas.webgl");

// scene

const scene = new THREE.Scene();

// camera

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
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

const sizes = {
  width: window.innerHeight,
  height: window.innerHeight,
};

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

// lights

const directionalLight = new THREE.DirectionalLight('#ffffff' , 1);
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
scene.add(ambientLight)
directionalLight.position.set(2,2,2)
scene.add(directionalLight)


const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: "white" })
);

mesh.rotation.x = -Math.PI/2;
const clock = new THREE.Clock();

// renderer

renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.set(2, 2, 2);

// orbit controls

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// models

let mixer = null;

const gltfLoader  = new GLTFLoader()
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => 
    {
        // const children = [...gltf.scene.children]
        // for(const child of children){
            //     scene.add(child);
            // }
            
        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[0]);

        action.play();

        gltf.scene.scale.set(0.025,0.025,0.025);

        scene.add(gltf.scene)
        
    }
)

let previousTime = 0;

const tick = () => {
  let elapsedTime = clock.getElapsedTime();
  let deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  controls.update();
  renderer.render(scene, camera);

  if(mixer){

      mixer.update(deltaTime);
  }
  window.requestAnimationFrame(tick);
};

tick();

scene.add(mesh);
