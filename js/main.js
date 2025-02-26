import * as THREE from '../lib/three.module.min.js';
import { Timer } from '../lib/three.timer.min.js';
import { GLTFLoader } from '../lib/three.gltf.module.min.js';
import { GUI } from '../lib/dat.gui.min.js';

import { animation, checkButtonAnim, blackHoleAnim} from './animation.js';
import { manageRoads } from './roadManager.js';
import Player from './Player.js';
import GameManager from './GameManager.js';

export let gameManager = new GameManager();

const RESSOURCES = "../../";

const gui = new GUI();

let nbrPlayer = 3;
for (let i = 0; i < nbrPlayer; i++) {
    gameManager.players[i] = new Player(i);
}

function loadLBpromise(path) {
    return new Promise((resolve, reject) => {
        const loaderLB = new GLTFLoader();
        loaderLB.load(path, function (gltf) {
            gameManager.longBox = gltf.scene;
            gameManager.longBoxAnim = THREE.AnimationClip.findByName(gltf.animations, 'CubeAction');
            resolve("resolved");
        }, function (xhr) {
            console.log('longpush = ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        }, reject);
    });
}

function loadGastlyPromise(path) {
    return new Promise((resolve, reject) => {
        const loaderPad = new GLTFLoader();
        loaderPad.load(path, function (gltf) {
            gameManager.box = gltf.scene;
            resolve("resolved");
        }, function (xhr) {
            console.log('gastly = ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        }, reject);
    });
}

function loadPadPromise(path) {
    return new Promise((resolve, reject) => {
        const loaderBox = new GLTFLoader();
        loaderBox.load(path, function (gltf) {
            gameManager.pad = gltf.scene;
            gameManager.pad.children[0].children[0].geometry.boundingBox.setFromObject(gameManager.pad.children[0]);
            resolve("resolved");
        }, function (xhr) {
            console.log('pad = ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        }, reject);
    });
}

function loadRoadPromise(path) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(path, function (gltf) {
            gameManager.road = gltf.scene;
            gameManager.roads.push(gltf.scene);
            gltf.scene.scale.set(1, 1, 0.8);
            gltf.scene.rotation.y = Math.PI / 2;
            gameManager.scene.add(gltf.scene);

            let secondRoad = gltf.scene.clone();
            gameManager.roads.push(secondRoad);
            secondRoad.scale.set(1, 1, 0.8);
            secondRoad.position.z = -255;
            secondRoad.rotation.y = Math.PI / 2;
            gameManager.scene.add(secondRoad);
            resolve("resolved");
        }, function (xhr) {
            console.log('road = ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        }, reject);
    });
}


let mixer;

function loadBHPromise(path) {
    return new Promise((resolve, reject) => {
        const blackHoleLoader = new GLTFLoader();
        blackHoleLoader.load(path, function (gltf) {
            gltf.scene.position.set(0, 6, -12);
            gltf.scene.rotation.set(Math.PI / 8, 0, 0);
            gltf.scene.scale.set(2.5, 2.5,);
            gameManager.blackHole = gltf.scene;
            mixer = new THREE.AnimationMixer(gltf.scene);

            const clip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001');
            const action = mixer.clipAction(clip);
            action.play();
            resolve("resolved");
        }, function (xhr) {

            console.log('blackhole = ' + (xhr.loaded / xhr.total * 100) + '% loaded');

        }, reject);
    });
}

let longBoxPromise = loadLBpromise(RESSOURCES + 'longPush.glb');
let blackHolePromise = loadBHPromise(RESSOURCES + 'blackhole.glb');
let roadPromise = loadRoadPromise(RESSOURCES + 'road.glb');
let padPromise = loadPadPromise(RESSOURCES + 'pad.glb');
let gastlyPromise = loadGastlyPromise(RESSOURCES + 'gastly.glb');

function onWindowResize() {
    gameManager.camera.aspect = window.innerWidth / window.innerHeight;
    gameManager.camera.updateProjectionMatrix();
    gameManager.renderer.setSize(window.innerWidth, window.innerHeight);
    gameManager.rendererScene.setSize(window.innerWidth, window.innerHeight);
    gameManager.composer.setSize(window.innerWidth, window.innerHeight);
}

document.body.addEventListener('keydown', gameManager.event.keyPressed.bind(gameManager.event));
document.body.addEventListener('keyup', gameManager.event.keyReleased.bind(gameManager.event));
window.addEventListener('resize', onWindowResize);

document.body.addEventListener('mousemove', gameManager.event.onMouseMove, false);
document.body.addEventListener('mousedown', gameManager.event.onClickEvent);
document.body.addEventListener('mouseup', title_screen_button);
document.body.addEventListener('click', gameManager.event.onMouseReleased);

const canvas = document.createElement('canvas');
canvas.width = 450;
const context = canvas.getContext('2d');
context.fillStyle = 'green';
context.font = '40px sans-serif';
context.fillText(gameManager.score, 0, 30);
const texture = new THREE.Texture(canvas);
texture.needsUpdate = true;
var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
});
material.transparent = true;
var mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 2), material);
mesh.position.y = 3;
mesh.position.x = 0.5;
gameManager.scene.add(mesh);


let scoreTab = [];
for (let i = 0; i < gameManager.players.length; i++) {
    scoreTab[i] = gameManager.players[i];
}

function writeScore() {
    gameManager.score = gameManager.players[0].score;
    context.font = '20px serif'
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(gameManager.score, 0, 30);
    context.fillText(gameManager.scoreNotation, 0, 70);
    for (let j = 0; j < 4 && j < scoreTab.length; j++){
        for (let i = 0; i < gameManager.players.length; i++) {
            if (gameManager.players[i].score > scoreTab[j].score) {
                let pos = scoreTab.indexOf(gameManager.players[i]);
                if (pos != -1 && pos > j) {
                    scoreTab[pos] = scoreTab[j];
                    scoreTab[j] = gameManager.players[i];
                } else if (pos == -1){
                    scoreTab[j] = gameManager.players[i];
                }
            }
        }
        context.fillText(scoreTab[j].username + ": " + scoreTab[j].score, 275, 30 * (j + 1));
    }
    texture.needsUpdate = true;
}

const collisionTimer = new Timer();

function init() {
    const SoundControl = function () {
        this.volume = gameManager.audio.music.getVolume();
    };

    const soundControl = new SoundControl();

    gui.add(soundControl, 'volume', 0, 1, 0.01).onChange(function () {
        gameManager.audio.music.setVolume(soundControl.volume);
    });

    gameManager.padMiddle.pad = gameManager.pad.clone();
    gameManager.padMiddle.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padMiddle.pad.children[0].children[0].geometry = gameManager.pad.children[0].children[0].geometry.clone();
    gameManager.padMiddle.pad.position.set(0, 0.1, 3);
    gameManager.padMiddle.emissiveColorReleased = new THREE.Color(0x6e52b4);
    gameManager.padMiddle.emissiveColorPressed = new THREE.Color(0x895CFB);
    gameManager.padMiddle.pad.getObjectByName("Cylinder001").material.emissive = gameManager.padMiddle.emissiveColorReleased;

    gameManager.padLeft.pad = gameManager.pad.clone(true);
    gameManager.padLeft.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padLeft.pad.children[0].children[0].geometry = gameManager.pad.children[0].children[0].geometry.clone();
    gameManager.padLeft.pad.position.set(-1, 0.1, 3);
    gameManager.padLeft.emissiveColorReleased = new THREE.Color(0x26d8ff);
    gameManager.padLeft.emissiveColorPressed = new THREE.Color(0x009DF8);
    gameManager.padLeft.pad.getObjectByName("Cylinder001").material.emissive = gameManager.padLeft.emissiveColorReleased;

    gameManager.padRight.pad = gameManager.pad.clone(true);
    gameManager.padRight.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padRight.pad.children[0].children[0].geometry = gameManager.pad.children[0].children[0].geometry.clone();
    gameManager.padRight.pad.position.set(1, 0.1, 3);
    gameManager.padRight.emissiveColorReleased = new THREE.Color(0x87ff53);
    gameManager.padRight.emissiveColorPressed = new THREE.Color(0x3FD64F);
    gameManager.padRight.pad.getObjectByName("Cylinder001").material.emissive = gameManager.padRight.emissiveColorReleased;

    gameManager.camera.rotation.x = -1 * Math.PI / 10;
    gameManager.camera.position.set(0, 3.5, 6.5);

    gameManager.light.position.set(0, 8, 0);
    gameManager.light.castShadow = true;

    gameManager.scene.add(gameManager.padMiddle.pad);
    gameManager.scene.add(gameManager.padLeft.pad);
    gameManager.scene.add(gameManager.padRight.pad);
    gameManager.scene.add(gameManager.light);
}

const clockBH = new THREE.Clock(true);

let clockFPS = new THREE.Clock();
let delta = 0;
let fps = 1 / 60;
let title_screen = true;

function animate() {
    requestAnimationFrame(animate);
    delta += clockFPS.getDelta();

    if (delta > fps) {
        gameManager.composer.render();
        gameManager.timer.update();

        if (title_screen == false) {
            gameManager.playmusic();
        }
        writeScore();
        gameManager.checkPlayersScore();
        context.fillText("test", 100, 100);
        checkButtonAnim();
        blackHoleAnim(gameManager.blackHole, gameManager.blackHoleAnim);

        manageRoads(gameManager);

        gameManager.cleanBlocks();

        gameManager.collisionBlocksPads();

        collisionTimer.update();
        gameManager.collisionTime += collisionTimer.getDelta();
        if (gameManager.event.cameraAnim)
            animation();
        mixer.update(clockBH.getDelta());
        delta = delta % fps;
    }
}

function title_screen_button() {
    if ((gameManager.mouse.x > -0.22 && gameManager.mouse.x < -0.15) && (gameManager.mouse.y > 0.27 && gameManager.mouse.y < 0.30))
        title_screen = false
    console.log(gameManager.mouse.x * canvas.width / window.innerWidth)
    console.log((100 / window.innerWidth) * 2 - 1)
}

async function preload() {
    const [blackhole, road, pad, gastly, longBox] = await Promise.all([blackHolePromise, roadPromise, padPromise, gastlyPromise, longBoxPromise]).catch((reason) => {
        console.error(reason);
        return new Array(5);
    });

    if (!blackhole || !road || !pad || !gastly || !longBox) {
        alert("Textures load problems !");
    } else {
        init();
        animate();
    }
}

preload();