import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';




const getAspectRatio = () => window.innerWidth / window.innerHeight;
const isWideScreen = () => getAspectRatio() > 0.7;

const setCameraPosition = (camera) => {
  const position = isWideScreen() ? [-1, 4, 12] : [0, 4, 28];
  camera.position.set(...position);
  camera.lookAt(0, 3, 0);
};




const STAR_SPREAD_RADIUS = 20;

const createStarPosition = () => new THREE.Vector3().randomDirection().setLength(STAR_SPREAD_RADIUS);
const createStarVelocity = () => new THREE.Vector3().randomDirection().setLength(0.01);

const createStar = () => {
  const geomtery = new THREE.SphereGeometry(0.02);
  const material = new THREE.MeshBasicMaterial({ color: 0xffd0ff });
  const mesh = new THREE.Mesh(geomtery, material);

  const pos = createStarPosition();
  const vel = createStarVelocity();
  mesh.position.set(pos.x, pos.y, pos.z);

  return { mesh, vel };
};

const animateStars = (stars) => {
  const origin = new THREE.Vector3(0, 0, 0);
  stars.forEach(star => {
    star.mesh.position.add(star.vel);
    if (star.mesh.position.distanceTo(origin) > STAR_SPREAD_RADIUS) {
      const pos = createStarPosition();
      const vel = createStarVelocity(pos);
      star.mesh.position.set(pos.x, pos.y, pos.z);
      star.vel = vel;
    }
  });
}




let i = 0;
const movePointLight = (pointLight, curvePoints, nPoints) => {
  const fadingDuration = 0.05;
  const fadingStep = 1 / (nPoints * fadingDuration);
  const fadingInEnd = fadingDuration;
  const fadingOutStart = 1 - fadingDuration;

  pointLight.position.set(...curvePoints[i]);
  const material = pointLight.children[0].material;
  if (i < fadingInEnd * nPoints) {
    pointLight.intensity += fadingStep;
    material.setValues({ opacity: material.opacity + fadingStep });
  } else if (i > fadingOutStart * nPoints) {
    pointLight.intensity -= fadingStep;
    material.setValues({ opacity: material.opacity - fadingStep });
  }

  const passedSegments = Math.floor(i / nPoints * 5);
  if (passedSegments % 2) i += 3;
  i++;
  if (i >= nPoints) {
    i = 0;
  }
}




const main = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, getAspectRatio(), 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  setCameraPosition(camera);

  const textureLoader = new THREE.TextureLoader();
  const spaceTexture = textureLoader.load('space.jpg');
  const lightTexture = textureLoader.load('light.jpg');
  scene.background = spaceTexture;

  // const ambientLight = new THREE.AmbientLight(0x505050);
  // scene.add(ambientLight);
  const lightColor = 0x9000ff;
  const sphere = new THREE.SphereGeometry(0.1);
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: lightTexture, transparent: true, opacity: 0 });
  const sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
  const pointLight = new THREE.PointLight(lightColor, 0, 5);
  pointLight.position.set(-4, 5.5, 0);
  pointLight.add(sphereMesh);
  scene.add(pointLight);

  // const controls = new OrbitControls(camera, renderer.domElement);
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
  // const gridHelper = new THREE.GridHelper(10, 10);
  // scene.add(gridHelper);

  const loader = new FontLoader();
  loader.load('droid_serif_regular.typeface.json', (font) => {
    const height = 0.2;
    const size = 2;
    const lines = [
      { text: 'Маша,',    position: [-4.5, 4.6, 0] },
      { text: 'я скучаю', position: [-6, 2.3, 0]   },
      { text: 'по тебе',  position: [-5, 0, 0]     },
    ];
    const material = new THREE.MeshStandardMaterial();
    for (const line of lines) {
      const geometry = new TextGeometry(line.text, { font, height, size });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...line.position);
      scene.add(mesh);
    }
  });

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, 6.1, 0),
    new THREE.Vector3(0, 5.6, 1),
    new THREE.Vector3(7, 5.1, 0),
    new THREE.Vector3(0, 4.45, -1),
    new THREE.Vector3(-7, 3.8, 0),
    new THREE.Vector3(0, 3.3, 1),
    new THREE.Vector3(7, 2.8, 0),
    new THREE.Vector3(0, 2.15, -1),
    new THREE.Vector3(-7, 1.5, 0),
    new THREE.Vector3(0, 1, 1),
    new THREE.Vector3(7, 0.5, 0)
  ]);

  const nPoints = 1000;
  const curvePoints = curve.getPoints(nPoints);
  // const curveGeomtery = new THREE.BufferGeometry().setFromPoints(curvePoints);
  // const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  // const curveObject = new THREE.Line(curveGeomtery, curveMaterial);
  // scene.add(curveObject);

  const stars = Array(30).fill().map(() => createStar());
  stars.forEach(star => scene.add(star.mesh));

  const animate = () => {
    requestAnimationFrame(animate);
    movePointLight(pointLight, curvePoints, nPoints);
    animateStars(stars);
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = getAspectRatio();
    setCameraPosition(camera);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  document.body.appendChild(renderer.domElement);
  animate();
}




if (WebGL.isWebGLAvailable()) {
  main();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}