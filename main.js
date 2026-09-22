import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/MTLLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0)
});

// This tracks the MTL, OBJ, and image files referenced by the MTL.
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
    window.updateLoadingProgress(itemsLoaded, itemsTotal, itemUrl);
};

loadingManager.onError = (itemUrl) => {
    window.loadingFailed(`Could not load ${itemUrl}`);
};

async function loadPortalGun() {
    const modelPath = "./models/portalgun/";

    const mtlLoader = new MTLLoader(loadingManager);
    mtlLoader.setPath(modelPath);

    const materials = await new Promise((resolve, reject) => {
        mtlLoader.load(
            "Portal Gun.mtl",
            resolve,
            undefined,
            reject
        );
    });

    materials.preload();

    const objLoader = new OBJLoader(loadingManager);
    objLoader.setPath(modelPath);
    objLoader.setMaterials(materials);

    const portalGun = await new Promise((resolve, reject) => {
        objLoader.load(
            "Portal Gun.obj",
            resolve,
            undefined,
            reject
        );
    });

    portalGun.position.set(0, 0, 0);
    portalGun.scale.set(1, 1, 1);

    scene.add(portalGun);

    window.finishLoading();

    return portalGun;
}

loadPortalGun().catch((error) => {
    window.loadingFailed(error);
});

window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
    requestAnimationFrame(animate);

    world.step(1 / 60);
    renderer.render(scene, camera);
}

animate();
