import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { randInt } from 'three/src/math/MathUtils.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

import {createBox, createLongBox, createRapidBox} from './createobject.js';
import {keyPressed, keyReleased} from './events.js';
import GameManager from './GameObject.js';

export let gameManager = new GameManager();

document.body.addEventListener('keydown', keyPressed);
document.body.addEventListener('keyup', keyReleased);

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

const loader = new GLTFLoader();
loader.load( 'road.glb', function ( gltf ) {
    gltf.scene.rotation.y = Math.PI / 2;
    console.log(gltf.scene);
    gltf.scene.children[0].children[1].material.emissiveIntensity = 10;
    gameManager.scene.add( gltf.scene );
}, undefined, function ( error ) {
    console.log( error );
}
)

let mixer;

const blackHoleLoader = new GLTFLoader();
loader.load( 'blackhole.glb', function ( gltf ) {
    
    gltf.scene.position.set(0, 3, -12);
    gltf.scene.rotation.set(Math.PI / 9, 0, 0);
    gltf.scene.scale.set(2.5,2.5,);
    gameManager.blackHole = gltf.scene;
    mixer = new THREE.AnimationMixer(gltf.scene);

    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Take 001');
    const action = mixer.clipAction(clip);
    action.play();
}, undefined, function ( error ) {
    console.log( error );
}
)



function init() {

    gameManager.padMiddle.pad.position.set(0, 0, 3);

    gameManager.padLeft.pad.position.set(-1, 0, 3);

    gameManager.padRight.pad.position.set(1, 0, 3);

    gameManager.camera.rotation.x = -1 * Math.PI / 10;
    gameManager.camera.position.set(0, 3.5, 6.5);

    gameManager.light.position.set(0, 7, 0);
    gameManager.light.castShadow = true;

    gameManager.scene.add(gameManager.padMiddle.pad);
    gameManager.scene.add(gameManager.padLeft.pad);
    gameManager.scene.add(gameManager.padRight.pad);
    gameManager.scene.add(gameManager.light);
}


function spawnBlocks(){
    gameManager.time += gameManager.timer.getDelta();
    if (gameManager.time > gameManager.spawnTimer){
        let randomBox = randInt(0, 2);
        if (randomBox == 0)
            gameManager.boxes.push(createLongBox(0xff2062));
        else if (randomBox == 1)
            gameManager.boxes.push(createBox(0xff2062))
        else if (randomBox == 2)
            gameManager.boxes.push(createRapidBox(0xcc2062))
        gameManager.scene.add(gameManager.boxes[gameManager.boxes.length - 1]);
        gameManager.boxes[gameManager.boxes.length - 1].position.z = gameManager.boxParams.spawnPosition;
        gameManager.boxes[gameManager.boxes.length - 1].position.y = gameManager.boxParams.positionY;
        gameManager.boxes[gameManager.boxes.length - 1].position.x = randInt(-1,1);
        gameManager.time = 0;
    }
}

function addScoreAnim() {
    if (gameManager.scoreJump < gameManager.scoreToAdd) {
        gameManager.cameraAnimationT += gameManager.cameraAnimationC.getDelta();
        if (gameManager.cameraAnimationT >= 0.03) {
            gameManager.score++;
            gameManager.scoreJump++;
            gameManager.cameraAnimationT = 0;
        }
    }
    if (gameManager.scoreJump == gameManager.scoreToAdd) {
        gameManager.scoreJump = 0;
        gameManager.scoreToAdd = 0;
        gameManager.scoreAnim = false;
    }
}

function animation() {

    if (gameManager.inversion == -1 && gameManager.camera.position.z < 7.2) {
        gameManager.cameraAnimationT += gameManager.cameraAnimationC.getDelta();
        if (gameManager.cameraAnimationT >= 0.01) {
            gameManager.camera.position.z  += 0.1;
            gameManager.cameraAnimationT = 0;
        }
        gameManager.camera.fov = 90;
        gameManager.camera.updateProjectionMatrix();
    }
    else if (gameManager.inversion == 1 && gameManager.camera.position.z > 6.5) {
        gameManager.cameraAnimationT += gameManager.cameraAnimationC.getDelta();
        if (gameManager.cameraAnimationT >= 0.01) {
            gameManager.camera.position.z  -= 0.1;
            gameManager.cameraAnimationT = 0;
        }
        gameManager.camera.fov = 70;
        gameManager.camera.updateProjectionMatrix();
    }
    else {
        gameManager.cameraAnim = false;
    }
}

const clockBH = new THREE.Clock(true);

function animate(){
    requestAnimationFrame(animate);
    //gameManager.renderer.render(gameManager.scene, gameManager.camera);
    gameManager.composer.render();
    gameManager.timer.update();
    gameManager.controls.update();

    writeScore();

    gameManager.cleanBlocks();

    let tabintersect = [];
    gameManager.collisionBlocksPads(tabintersect);
   
    collisionTimer.update();
    gameManager.collisionTime += collisionTimer.getDelta();
    spawnBlocks();
    if (gameManager.cameraAnim)
        animation();
    if (gameManager.scoreAnim)
        addScoreAnim(10);
    mixer.update(clockBH.getDelta());
}
init();
animate();