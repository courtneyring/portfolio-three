import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Update all materials
 */

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Imported Model
 */

gltfLoader.load("/models/island.glb", (model) => {
  const island = model.scene;
  scene.add(island);
  console.log(island);
  updateAllMaterials();
});

/**
 * Test Model
 */

// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial({ color: 0xff0000 })
// );
// scene.add(cube);
// cube.position.set(20.5, 1, 3)

// gui.add(cube.position, 'x', -100, 100, 0.5)
// gui.add(cube.position, 'y', -100, 100, 0.5)
// gui.add(cube.position, 'z', -100, 100, 0.5)

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
directionalLight.position.set(0.5, 0, 0.866); // ~60º
directionalLight.name = "main_light";
scene.add(directionalLight);


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
var camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.up = new THREE.Vector3(0, 2, 0);
// camera.position.set(0, 50, 0)

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false;

// gui.add(controls, 'enabled').onChange(()=>{
//     if (!controls.enabled) {
//         window.removeEventListener("mousewheel", throttle(updatePos, 50));
//     }
//     else {
//         window.addEventListener("mousewheel", throttle(updatePos, 50));
//     }
// })

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 3.85;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.useLegacyLights = false;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const neutralEnvironment = pmremGenerator.fromScene(
  new RoomEnvironment()
).texture;
scene.environment = neutralEnvironment;


// camera.position.z = 30;

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-40, 2, 0),
  new THREE.Vector3(-38, 2, 0),
  new THREE.Vector3(-37, 2, -0.5),
  new THREE.Vector3(-37, 2, -0.5),
  new THREE.Vector3(-36, 2, -1),
  new THREE.Vector3(-35, 2, -2),
  new THREE.Vector3(-34, 2, -3),
  new THREE.Vector3(-32, 2, -5),
  new THREE.Vector3(-28.5, 2, -7.5),
  new THREE.Vector3(-25, 2, -9),
  new THREE.Vector3(-22.5, 2, -9.25),
  new THREE.Vector3(-20.5, 2, -9),
  new THREE.Vector3(-16, 2, -7),
  new THREE.Vector3(-15, 2, -6.5),
  new THREE.Vector3(-10.5, 2, -2),
  new THREE.Vector3(-6, 2, 3),
  new THREE.Vector3(-2, 2, 7),
  new THREE.Vector3(5, 2, 8.75),
  new THREE.Vector3(12, 2, 7),
  new THREE.Vector3(15.5, 2, 4),
  new THREE.Vector3(20.5, 2, -3),
  new THREE.Vector3(24.5, 2, -7.5),
  new THREE.Vector3(27.5, 2, -9),
  new THREE.Vector3(30, 2, -9.25),
  new THREE.Vector3(34, 2, -8.5),
  new THREE.Vector3(37.5, 2, -5.5),
  new THREE.Vector3(40, 2, -2.5),

]);

var points = curve.getPoints(50);
var geometry = new THREE.BufferGeometry().setFromPoints(points);

var material = new THREE.LineBasicMaterial({ color: 0xffffff });

// Create the final object to add to the scene
var curveObject = new THREE.Line(geometry, material);

scene.add(curveObject);
curveObject.visible = false

var clock = new THREE.Clock();
clock.start();

var speed = 0.5;

var pathTarget = new THREE.Vector3(0, 0, 0);
var lookTarget = new THREE.Vector3(0, 0, 0);
let pos = 0;

const updatePos = () => {
  if (pos >= 0.89) {
    return
  } else pos += 0.01;
  curve.getPoint((pos) % 1.0, pathTarget);
  curve.getPoint((pos+0.1) % 1.0, lookTarget);
    camera.position.copy(pathTarget);
    camera.lookAt(lookTarget);
};

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

window.addEventListener("mousewheel", throttle(updatePos, 50));

updatePos();

/**
 * Animate
 */
const tick = () => {
  // Update controls
  // controls.update()

  curve.getPoint((clock.getElapsedTime() * speed) % 1.0, pathTarget);

  // cube.position.copy(pathTarget)
//   camera.position.copy(pathTarget);
//   camera.lookAt(cube.position);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
