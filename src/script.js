import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";


// GLOBALS
let raycaster = new THREE.Raycaster();
let objects = [], rooms = [];
let intersects = null;
let count = 6;
let flag = true;
let currentIntersect = null;

const dracoLoader = new DRACOLoader();

let decoderPath = "https://www.gstatic.com/draco/v1/decoders/";
dracoLoader.setDecoderPath(decoderPath);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

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

/* PERSPECTIVE */

// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.set(2, 2, 2);

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
camera.position.y = 2;
camera.position.z = 2;
camera.lookAt(scene.position);

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// renderer

renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x2e2e2e);

camera.position.set(10, 10, 10);
// camera.updateProjectionMatrix();

// orbit controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

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

/* ***************************************** */

// FLOOR

function createFloor(floor) {
  gltfLoader.load("/models/BUILDING/living.gltf", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    console.log(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh)
        o.userData.originalMaterial = o.material
    });
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    console.log(gltf.scene);
    console.log("done")
    rooms.push(gltf.scene);
    floor.add(gltf.scene);
  });
  gltfLoader.load("/models/BUILDING/bedroom.gltf", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    console.log(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh) o.userData.originalMaterial = o.material
    });
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    rooms.push(gltf.scene);
    floor.add(gltf.scene);
  });
  gltfLoader.load("/models/BUILDING/bedroom2.gltf", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    console.log(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh) o.userData.originalMaterial = o.material
    });
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    rooms.push(gltf.scene);
    floor.add(gltf.scene);
  });
  gltfLoader.load("/models/BUILDING/bathroom.gltf", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    console.log(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh) o.userData.originalMaterial = o.material
    });
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    rooms.push(gltf.scene);
    floor.add(gltf.scene);
  });
  gltfLoader.load("/models/BUILDING/bathroom2.gltf", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    var model = gltf.scene;
    console.log(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh) o.userData.originalMaterial = o.material
    });
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    rooms.push(gltf.scene);
    floor.add(gltf.scene);
  });
}

function createBuilding() {
  let height = -0.1;

  // BUILDING

  for (let currFloor = 0; currFloor < count; currFloor++, height += 1.7) {
    const floor = new THREE.Group();
    createFloor(floor);
    floor.position.set(8, height, 6);
    floor.castShadow = true;
    scene.add(floor);
    objects.push(floor);
  }
}

// // BUILDING MOUSE EVENTS

console.log(objects)

function changeFloorColor() {
  for (let i = 1; i < count; i++) {
    objects[i].visible = false;
  }

  for (const floor of objects) {
    for (const model of floor.children) {
      model.traverse((o) => {
        if (o.isMesh) o.material = o.userData.originalMaterial
      });
    }
  }

  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }
  console.log(currentIntersect)

  // remove scene & create new

  if (currentIntersect && currentIntersect !== null && currentIntersect !== undefined) {
    let idx = null;
    if (currentIntersect) {
      let p = currentIntersect.object.parent;
      while (1) {
        idx = objects.indexOf(p);
        if (idx !== null && idx !== undefined && idx !== -1) {
          break;
        }
        p = p.parent;
      }

      console.log(idx);

      // changing visibility of floor

      for (let i = 1; i <= idx; i++) {
        objects[i].visible = true;
      }

      // traversing floor and changing color of floor

      if (objects[idx] && objects[idx] !== undefined && objects[idx] !== null) {
        for (const model of objects[idx].children) {
          model.traverse((o) => {
            var newMaterial = new THREE.MeshNormalMaterial();
            if (o.isMesh) o.material = newMaterial;
          });
        }
      }
    }
  }
}

function changeRoomColor() {

  // default material

  for (const floor of objects) {
    for (const model of floor.children) {
      model.traverse((o) => {
        if (o.isMesh) o.material = o.userData.originalMaterial
      });
    }
  }

  if (intersects.length) {
    currentIntersect = intersects[0];
  } else {
    currentIntersect = null;
  }
  console.log(currentIntersect)


  if (currentIntersect && currentIntersect !== null && currentIntersect !== undefined) {
    let idx = null;
    if (currentIntersect) {
      let p = currentIntersect.object.parent;
      while (1) {
        idx = rooms.indexOf(p);
        if (idx !== null && idx !== undefined && idx !== -1) {
          break;
        }
        p = p.parent;
      }

      console.log(idx);

      // traversing floor and changing color of floor

      if (rooms[idx] && rooms[idx] !== undefined && rooms[idx] !== null) {
        for (const model of rooms[idx].children) {
          model.traverse((o) => {
            var newMaterial = new THREE.MeshNormalMaterial();
            if (o.isMesh) o.material = newMaterial;
          });
        }
      }
    }
  }


}

//Click function to change scene

window.addEventListener("click", () => {
  if (flag) {
    if (currentIntersect !== null) {
      deleteGroup();
    }
    camera.zoom = 1.8;
    camera.updateProjectionMatrix();

    changeToFloorView();
    flag = false;
  } else {
    if (currentIntersect !== null) {
      deleteGroup();
    }
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    createBuilding();
    flag = true;
  }
});

// // FLOOR MOUSE EVENTS

function changeToFloorView() {
  const floor = new THREE.Group();
  createFloor(floor);
  floor.position.set(5, 0, 3);
  console.log(floor);
  objects.push(floor);
  scene.add(floor);
}

// // DELETE ENTITY

function deleteGroup() {
  for (const group of objects) {
    scene.remove(group);
  }

  objects = [];
}

// // function calls

if (flag) {
  createBuilding();
}

/* ************************************************************ */

// animate fucntion

const animate = () => {

  // camera.updateProjectionMatrix();

  // controls.update();
  // raycaster from mouse to camera

  raycaster.setFromCamera(mouse, camera);

  // checking objects intersecting
  intersects = raycaster.intersectObjects(scene.children, true);

  // changing color and visibility

  if (flag) {
    changeFloorColor();
  } else {
    changeRoomColor();
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
