import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { randInt } from 'three/src/math/MathUtils.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

import {animation, addScoreAnim} from './animation.js';
import {createBox, createLongBox, createRapidBox} from './createobject.js';
import { manageRoads } from './roadManager.js';
import GameManager from './GameObject.js';

export let gameManager = new GameManager();

function loadObject(path) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load( path, resolve, undefined, reject);
    });
}

const clockBPM = new THREE.Clock(false);
let timerBPM = 0;

const musicListener = new THREE.AudioListener();
gameManager.camera.add(musicListener);
const music = new THREE.Audio(musicListener);
const musicLoader = new THREE.AudioLoader();
musicLoader.load( './ado.mp3', function (buffer) {
    music.setBuffer(buffer);
    music.setVolume(0.04);
    window.addEventListener('click', function() {
        music.play();
        clockBPM.start();
    }, undefined, function(error) {
        console.log(error);
    });
});


const loaderLB = new GLTFLoader();
loaderLB.load( 'longPush.glb', function ( gltf ) {
    gameManager.longBox = gltf.scene;
    gameManager.longBoxAnim = THREE.AnimationClip.findByName(gltf.animations, 'CubeAction');
}, function ( xhr ) {
    console.log('longpush = ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.log( error );
});

const loaderPad = new GLTFLoader();
loaderPad.load( 'gastly.glb', function ( gltf ) {
    gameManager.box = gltf.scene;
}, function ( xhr ) {
    console.log('gastly = ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.log( error );
});

const loaderBox = new GLTFLoader();
loaderBox.load( 'pad.glb', function ( gltf ) {
    gameManager.pad = gltf.scene;
    gameManager.pad.children[0].children[0].geometry.boundingBox.setFromObject(gameManager.pad.children[0]);
}, function ( xhr ) {
    console.log('pad = ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.log( error );
});

const loader = new GLTFLoader();
loader.load( 'road.glb', function ( gltf ) {
    gameManager.road = gltf.scene;
    gameManager.roads.push(gltf.scene);
    gltf.scene.scale.set(1,1,0.8);
    gltf.scene.rotation.y = Math.PI / 2;
    gameManager.scene.add( gltf.scene );
    let secondRoad = gltf.scene.clone();
    gameManager.roads.push(secondRoad);
    secondRoad.scale.set(1,1,0.8);
    secondRoad.position.z = -255;
    secondRoad.rotation.y = Math.PI / 2;
    gameManager.scene.add(secondRoad);
}, function ( xhr ) {
    console.log('road = ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
    console.log( error );
});


let mixer;

const blackHoleLoader = new GLTFLoader();
blackHoleLoader.load( 'blackhole.glb', function ( gltf ) {
    
    gltf.scene.position.set(0, 6, -12);
    gltf.scene.rotation.set(Math.PI / 8, 0, 0);
    gltf.scene.scale.set(2.5,2.5,);
    gameManager.blackHole = gltf.scene;
    mixer = new THREE.AnimationMixer(gltf.scene);

    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001');
    const action = mixer.clipAction(clip);
    action.play();
}, function ( xhr ) {

    console.log('blackhole = ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

}, function ( error ) {
    console.log( error );
});

let blackHolePromise = loadObject('blackhole.glb');
let roadPromise = loadObject('road.glb');
let padPromise = loadObject('pad.glb');
let gastlyPromise = loadObject('gastly.glb');

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

const canvas = document.createElement('canvas');
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
gameManager.scene.add(mesh);


function writeScore(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(gameManager.score, 0, 30);
    texture.needsUpdate = true;
}

const collisionTimer = new Timer();




function init() {
    gameManager.padMiddle.pad = gameManager.pad.clone();
    gameManager.padMiddle.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padMiddle.pad.position.set(0, 0, 3);
    gameManager.padMiddle.pad.getObjectByName("Cylinder001").material.emissive = new THREE.Color(0x6e52b4);

    gameManager.padLeft.pad = gameManager.pad.clone(true);
    gameManager.padLeft.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padLeft.pad.position.set(-1, 0, 3);
    gameManager.padLeft.pad.getObjectByName("Cylinder001").material.emissive = new THREE.Color(0x26d8ff)

    gameManager.padRight.pad = gameManager.pad.clone(true);
    gameManager.padRight.pad.getObjectByName("Cylinder001").material = gameManager.pad.getObjectByName("Cylinder001").material.clone();
    gameManager.padRight.pad.position.set(1, 0, 3);
    gameManager.padRight.pad.getObjectByName("Cylinder001").material.emissive = new THREE.Color(0x87ff53)

    gameManager.camera.rotation.x = -1 * Math.PI / 10;
    gameManager.camera.position.set(0, 3.5, 6.5);

    gameManager.light.position.set(0, 8, 0);
    gameManager.light.castShadow = true;

    gameManager.scene.add(gameManager.padMiddle.pad);
    gameManager.scene.add(gameManager.padLeft.pad);
    gameManager.scene.add(gameManager.padRight.pad);
    gameManager.scene.add(gameManager.light);
}


function spawnBlocks(nextNote){
    //gameManager.time += gameManager.timer.getDelta();
    //if (gameManager.time > gameManager.spawnTimer){
       // let randomBox = randInt(0, 2);
        //if (randomBox == 0) {
            gameManager.boxes.push([createBox(gameManager), nextNote]);
        //}
        //else if (randomBox == 1)
            //gameManager.boxes.push(createLongBox(gameManager))
       // else if (randomBox == 2)
            //gameManager.boxes.push(createRapidBox(0xcc2062))
        //console.log(gameManager.boxes[gameManager.boxes.length - 1][0]);
        gameManager.boxes[gameManager.boxes.length - 1][0].position.z = gameManager.boxParams.spawnPosition;
        gameManager.boxes[gameManager.boxes.length - 1][0].position.y = gameManager.boxParams.positionY;
        gameManager.boxes[gameManager.boxes.length - 1][0].position.x = gameManager.boxes[gameManager.boxes.length - 1][1][1];
        gameManager.scene.add(gameManager.boxes[gameManager.boxes.length - 1][0]);
        gameManager.time = 0;
    //}
}

const clockBH = new THREE.Clock(true);

const analyzer = new THREE.AudioAnalyser(music, 32);

let secperbeat = 60 / 132;
let lastsp = 0;

let notes = [[6, 0], [10, 1], [18, 0], [20, 0], [20.5, -1], [21, 1], [21.5, 0], [22, -1], [24, 1], [25, 0], [26, -1], [30, 0], [31, -1], [32, 0], [33, 0], [34, 0],
    [34.5, -1], [35, 0], [35.5, 1], [36, 0], [36.5,-1], [37, 0], [37.5, 1], [38, 0], [38.5, -1], [39, 0], [39.5, 1], [40, 0], [40.5, -1], [41, 0], [41.5, 1], [42, 0],
    [42.5, -1], [43, 0], [43.5, 1], [44, 0], [46, 1], [46, -1], [47, 1], [47, -1], [48, 1], [48, -1], [50, 1], [51, 0], [51.25, 1], [52, 1],
    [53, 0], [53.25, 1], [54, 1], [55, 0], [55.25, 1], [56, 1], [57, 0], [57.25, 1], [58, 1], [59, 0], [59.25, 1], [60, 1], [61, 0], [61.25, 1], [62, 1], [63, 0], [63.25, 1], [64, 1], [65, 0], [65.25, 1], [66, 1], [67, 0],
    [67.25, 1], [68, 1], [69, 0], [69.25, 1], [70, 1], [70, 0], [71, 1], [71, 0], [71.5, 1], [71.5, 0], [72, 1], [72, 0], [73, -1], [74, 0], [74.25, -1], [75, -1], [76, 0], [76.25, -1], [77, -1], [78, 0],
    [78.25, -1], [79, 0], [79.5, 0], [81, 1], [82, 0], [82.25, 1], [83, 1], [84, 0], [84.25, 1], [85, 1], [86, 0], [86.25, 1], [87, 1], [88, 0], [88.25, 1], [89, 1], [90, 0], [90.25, 1], [91, 1], [92, 0], [92.25, 1],
    [93, 1], [94, 0], [94.5, 1], [95, 1], [96, 0], [96.25, 1], [97, 1], [98, 0], [98.25, 1], [99, 1], [100, 0], [100.25, 1], [101, 1], [102, 0], [102.25, 1], [103, 1], [104, 0], [104.25, 1], [105, 1], [106, 0],
    [106.25, 1], [107, 1], [108, 0], [108.25, 1], [109, 1], [110, 0], [110.25, 1]];

/*let notes = [[6, 0], [10, 1], [18, -1], [19.5, 0], [20, 1], [20.5, 0], [21, -1], [22, 0], [24, 1], [25, 0], [26, -1], [29.5, 0], [30.5, -1], [31.5, 0], [33.5, 1], [34, 0],
    [34.5, -1], [35, 0], [35.5, 1], [36, 0], [36.5,-1], [37, 0], [37.5, 1], [38, 0], [38.5, -1], [39, 0], [39.5, 1], [40, 0], [40.5, -1], [41, 0], [41.5, 1], [42, 0],
    [42.5, -1], [43, 0], [43.5, 1], [44, 0], [46, 1], [46, -1], [47, 1], [47, -1], [48, 1], [48, -1], [50, 0],
    [51, -1], [52, 1], [53, -1], [54, 0], [55, 1], [56, -1], [57, 1], [58, -1], [59, -1], [60, 1], [61, 0], [62, 0]];*/

let nextNote = 0;

/*for (let i = 6; i < 200; i++) {
    notes.push(i);
}*/

let clockFPS = new THREE.Clock();
let delta = 0;
let fps = 1 / 60;


function animate(){
    requestAnimationFrame(animate);
    delta += clockFPS.getDelta();

    if (delta > fps) {
        gameManager.composer.render();
        gameManager.timer.update();
        gameManager.controls.update();
        if (music.isPlaying) {
            gameManager.bloomPass.strength = 0.3 + (analyzer.getAverageFrequency() / 200);
            lastsp = gameManager.songposinbeat;
            gameManager.songposinbeat = music.source.context.currentTime / secperbeat;
            //console.log("songposbeat = " + gameManager.songposinbeat);
            timerBPM += gameManager.songposinbeat - lastsp;
            //timerBPM += clockBPM.getDelta();
            //console.log("timer = " + timerBPM);
            if (music.isPlaying && nextNote < notes.length && notes[nextNote][0] <= gameManager.songposinbeat + 3) {
                spawnBlocks(notes[nextNote]);
                //console.log("bpm");
                timerBPM = 0;
                nextNote++;
            }
            //if (timerBPM >= 0.01) {
                for (let i = 0; i < gameManager.boxes.length; i++) {
                    //gameManager.boxes[i].position.z += gameManager.boxParams.speed * gameManager.inversion;
                    gameManager.boxes[i][0].position.lerpVectors(new THREE.Vector3(gameManager.boxes[i][1][1], gameManager.boxParams.positionY, 0), new THREE.Vector3(gameManager.boxes[i][1][1], gameManager.boxParams.positionY, 3), (3 - (gameManager.boxes[i][1][0] - gameManager.songposinbeat)) / 3);
                }
                timerBPM = 0;
            //}
        }
        writeScore();

        manageRoads(gameManager);

        gameManager.cleanBlocks();

        let tabintersect = [];
        gameManager.collisionBlocksPads(tabintersect);
    
        collisionTimer.update();
        gameManager.collisionTime += collisionTimer.getDelta();
        if (gameManager.event.cameraAnim)
            animation();
        if (gameManager.scoreAnim)
            addScoreAnim(10);
        mixer.update(clockBH.getDelta());
        delta = delta % fps;
    }
}

const [blackhole, road, pad, gastly] = await Promise.all([blackHolePromise, roadPromise, padPromise, gastlyPromise]).catch((reason) => {
    console.error(reason);
    return [undefined, undefined];
});

if (!blackhole || !road || !pad || !gastly) {
    alert("merde !");
} else{
    init();
    animate();
}