import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { randInt } from 'three/src/math/MathUtils.js';

function createBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    let boxmesh = new THREE.MeshBasicMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "box";
    return box;
}

function createLongBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 2, 1, 1, 1);
    let boxmesh = new THREE.MeshBasicMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "longbox";
    return box;
}

function createpad(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 0.1, 1, 1, 1, 1);
    let boxmesh = new THREE.MeshBasicMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    return box;
}

const timer = new Timer();
var boxes = [];
var tabremains = [];
var BOX = {
    SPEED : 0.01,
    POSITIONY : 0.55
}

let spawnTimer = 4;
let score = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const padmiddle = createpad(0x00ff00);
const padleft = createpad(0xff0000);
const padright = createpad(0x0000ff);

const raycasterpadm = new THREE.Raycaster(padmiddle.position, new THREE.Vector3(0, 1, 0));
const raycasterpadl = new THREE.Raycaster(padleft.position, new THREE.Vector3(0, 1, 0));
const raycasterpadr = new THREE.Raycaster(padright.position, new THREE.Vector3(0, 1, 0));

document.body.addEventListener('keydown', keyPressed);
document.body.addEventListener('keyup', keyReleased);



const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.fillStyle = 'green';
context.font = '40px sans-serif';
context.fillText(score, 0, 30);
const texture = new THREE.Texture(canvas);
texture.needsUpdate = true;
var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
});
material.transparent = true;
var mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 2), material);
mesh.position.y = 3.5;
scene.add(mesh);

function writeScore(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(score, 0, 30);
    texture.needsUpdate = true;
}

var collision = false;
const collisionTimer = new Timer();

var middlepressed = false;
var rightpressed = false;
var leftpressed = false;

const keymap = new Set();

let remains = false;


function keyReleased(e) {
    if (e.key == 'k')
        middlepressed = false;
    if (e.key == 'j')
        leftpressed = false;
    if (e.key == 'l')
        rightpressed = false;
    keymap.delete(e.key);
    remains = false;
    wrongHit = false;
    erasing = false;

}

function keyPressed(e) {
    keymap.add(e.key);
    for (let key of keymap){
        console.log(key);
        switch (key) {
            case 'e':
                camera.position.y += 0.1;
                break;
            case 'q':
                camera.position.y -= 0.1;
                break;
            case 'w':
                camera.position.z -= 0.1;
                break;
            case 's':
                camera.position.z += 0.1;
                break;
            case 'a':
                camera.position.x -= 0.1;
                break;
            case 'd':
                camera.position.x += 0.1;
                break;
            case 'ArrowUp':
                camera.rotation.x += Math.PI / 60;
                break;
            case 'ArrowDown':
                camera.rotation.x -= Math.PI / 60;
                break;
            case 'ArrowLeft':
                camera.rotation.y += Math.PI / 60;
                break;
            case 'ArrowRight':
                camera.rotation.y -= Math.PI / 60;
                break;
            case 'k':
                middlepressed = true;
                break;
            case 'j':
                leftpressed = true;
                break;
            case 'l':
                rightpressed = true;
                break;
        }
    }
}

var playerLife = 3;
let time = 0;
var wrongHit = false;
var erasing = false;

function init() {
    scene.add(padmiddle);
    scene.add(padleft);
    scene.add(padright);

    padmiddle.position.z = 3;

    padleft.position.x = -1;
    padleft.position.z = 3;

    padright.position.x = 1;
    padright.position.z = 3;

    camera.position.z = 6.5;
    camera.position.y = 3.5;
    camera.rotation.x = -1 * Math.PI / 10;
}

function longboxhit(key, box, pad){
    let newbox = 0;
    erasing = true;
    boxes.push(createLongBox(0xff2062));
    newbox = boxes.length - 1;
    boxes[newbox].position.y = BOX.POSITIONY;
    boxes[newbox].position.x = box.object.position.x;
    boxes[newbox].position.z = box.object.position.z - ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
    boxes[newbox].scale.z = box.object.scale.z - ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
    if (!remains && (box.object.position.z + box.object.scale.z) - pad.position.z >= 0.1) {
        tabremains.push(createLongBox(0xff2062));
        let nlength = tabremains.length - 1;
        tabremains[nlength].position.x = box.object.position.x;
        tabremains[nlength].position.y = BOX.POSITIONY;
        tabremains[nlength].scale.z = ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
        tabremains[nlength].position.z = pad.position.z + ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
        scene.add(tabremains[nlength]);
        remains = true;
    }
    scene.add(boxes[newbox]);
    boxes.splice(boxes.indexOf(box.object), 1);
    scene.remove(box.object);
    score += 1;
    console.log("score = " + score);
}

function boxhit(key, box, pad){
    collisionTime = 0;
    collision = true;
    if (key && box.object.name == "longbox") {
        if ((box.object.position.z + box.object.scale.z) - pad.position.z >= 0.05){
            longboxhit(key, box, pad)
        }
        if (box.object.scale.z <= 0.1) {
            boxes.splice(boxes.indexOf(box.object), 1);
            scene.remove(box.object);
        }
    } else {
        boxes.splice(boxes.indexOf(box.object), 1);
        scene.remove(box.object);
        score += 10;
        console.log("score = " + score);
    }
}

var collisionTime = 0;

function cleanBlocks() {
    for (let i = 0; i < tabremains.length; i++) {
        tabremains[i].position.z += BOX.SPEED;
        if ( tabremains[i].position.z >= 10){
            scene.remove( tabremains[i]);
            tabremains.splice(i, 1);
        }
    }

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].position.z += BOX.SPEED;
        if (boxes[i].position.z >= 10){
            scene.remove(boxes[i]);
            boxes.splice(i, 1);
        }
    }
}

function collisionBlocksPads(tabintersect) {
    tabintersect.push(raycasterpadm.intersectObjects(boxes, true));
    tabintersect.push(raycasterpadl.intersectObjects(boxes, true));
    tabintersect.push(raycasterpadr.intersectObjects(boxes, true));
    if (((leftpressed && tabintersect[1].length == 0)|| (middlepressed && tabintersect[0].length == 0) || (rightpressed && tabintersect[2].length == 0)) && collisionTime >= 0.7){
        wrongHit = true;
        if (score > 9)
            score -= 10;
        console.log("score = " + score);
        collisionTime = 0;
    }
    for (let j = 0; j < tabintersect.length; j++){
        for (let i = 0; i < tabintersect[j].length; i++) {
            if (j == 0 && middlepressed && !wrongHit){
                boxhit(middlepressed, tabintersect[j][i], padmiddle);
            } else if (j == 1 && leftpressed && !wrongHit) {
                boxhit(leftpressed, tabintersect[j][i], padright);
            } else if (j == 2 && rightpressed && !wrongHit) {
                boxhit(rightpressed, tabintersect[j][i], padright);
            }
        }
    }
}

function Spawnblocks(){
    time += timer.getDelta();
    if (time > spawnTimer){
        BOX.SPEED += 0.0001;
        spawnTimer -= 0.0001;
        let randombox = randInt(0, 1);
        if (randombox)
            boxes.push(createLongBox(0xff2062));
        else
            boxes.push(createBox(0xff2062))
        scene.add(boxes[boxes.length - 1]);
        boxes[boxes.length - 1].position.y = BOX.POSITIONY;
        boxes[boxes.length - 1].position.x = randInt(-1,1);
        time = 0;
    }
}

function animate(){
    timer.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    writeScore();

    cleanBlocks();

    let tabintersect = [];
    collisionBlocksPads(tabintersect);
   
    collisionTimer.update();
    collisionTime += collisionTimer.getDelta()

    Spawnblocks();
}
init();
animate();