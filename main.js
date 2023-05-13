import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function init() {
  const COLORS = {
    light: 0xffffff,
    sky: 0xf2f2f2,
    ground: 0xf2f2f2,
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.light);
  scene.fog = new THREE.Fog(COLORS.light, 1, 17);

  const size = {
    width: 0,
    height: 0,
  };

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const container = document.querySelector(".canvas__container");
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    75,
    size.width / size.height,
    0.1,
    100
  );
  camera.position.set(7, 1, 2);
  let cameraTarget = new THREE.Vector3(0, 4, 0);

  scene.add(camera);

  const directionalLight = new THREE.DirectionalLight(COLORS.light, 2);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.position.set(3, 10, 3);
//   const dlHelper = new THREE.DirectionalLightHelper(
//     directionalLight,
//     2,
//     "black"
//   );
//   dlHelper.update();
//   scene.add(dlHelper);

  const hemiLight = new THREE.HemisphereLight(COLORS.sky, COLORS.ground, 0.5);

  const lightGroup = new THREE.Group();
  lightGroup.add(directionalLight, hemiLight);
  scene.add(lightGroup);

  const plane = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.ground,
  });
  const floor = new THREE.Mesh(plane, floorMaterial);
  floor.receiveShadow = true;
  floor.rotateX(-Math.PI * 0.5);

  scene.add(floor);

  let models = {};

  const toLoad = [
    { name: "eva01", group: new THREE.Group(), file: "/models/eva-01.glb" },
    { name: "eva02", group: new THREE.Group(), file: "/models/eva-02.glb" },
  ];

  function setupAnimation() {
    models.eva02.position.x = 100;
    models.eva01.position.set(2, 0, -1);
    ScrollTrigger.matchMedia({
      "(prefers-reduced-motion: no-preference)": desktopAnimation,
    });
  }

  function desktopAnimation() {
    // const tl = gsap.timeline();
    const tl = gsap.timeline({
      default: {
        duration: 1,
        ease: "power2.inOut",
      },
      scrollTrigger: {
        trigger: ".page",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    // Section 2
    tl.to(camera.position, { x: 3.5, y: 6, z: 2 }, ".second");
    tl.to(models.eva01.position, { x: 2, z: -2 }, ".second");
    tl.to(models.eva01.rotation, { y: -2 }, ".second");

    // Section 3
    tl.to(models.eva01.rotation, { y: 0 }, ".third");
    tl.to(camera.position, { x: -5, y: 5, z: 5 }, ".third");
    tl.to(models.eva01.position, { x: -5.7, z: 4.5 }, ".third");
  }

  const LoadingManager = new THREE.LoadingManager(() => {
    setupAnimation();
  });
  const gltfLoader = new GLTFLoader(LoadingManager);

  toLoad.forEach((item) => {
    gltfLoader.load(
      item.file,
      (model) => {
        let eva = model.scene;
        eva.scale.set(0.05, 0.05, 0.05);
        eva.position.set(0, -2.97, 0);
        eva.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        item.group.add(model.scene);
        scene.add(item.group);
        models[item.name] = item.group;
      },
      undefined,
      (err) => console.log(err)
    );
  });

  const onResize = () => {
    size.width = container.clientWidth;
    size.height = container.clientHeight;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener("resize", onResize);
  onResize();

  const target = new THREE.Object3D();
  scene.add(target);
  // function for re-rendering/animating the scene
  function tick() {
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => tick());
  }
  tick();
}
init();
