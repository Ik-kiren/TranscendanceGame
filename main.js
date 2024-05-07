import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { randInt } from 'three/src/math/MathUtils.js';

function createBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    let boxmesh = new THREE.MeshBasicMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "box";
    return box;
};

function createLongBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 2, 1, 1, 1);
    let boxmesh = new THREE.MeshBasicMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "longbox";
    return box;
}

const timer = new Timer();
var boxes = [];
var tabremains = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const boxegeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
const rectanglegeom = new THREE.BoxGeometry(1, 0.1, 1, 1, 1, 1);

const meshreddish = new THREE.MeshBasicMaterial({color: 0xff2062});
const meshred = new THREE.MeshBasicMaterial({color:0xff0000});
const meshgreen = new THREE.MeshBasicMaterial({color:0x00ff00});
const meshblue = new THREE.MeshBasicMaterial({color:0x0000ff});

const boxmiddle = createBox(0xff2062);
const boxright = new THREE.Mesh(boxegeometry, meshgreen);

const padmiddle = new THREE.Mesh(rectanglegeom, meshred);
const padleft = new THREE.Mesh(rectanglegeom, meshgreen);
const padright = new THREE.Mesh(rectanglegeom, meshblue);

const raycasterpadm = new THREE.Raycaster(padmiddle.position, new THREE.Vector3(0, 1, 0));
const raycasterpadl = new THREE.Raycaster(padleft.position, new THREE.Vector3(0, 1, 0));
const raycasterpadr = new THREE.Raycaster(padright.position, new THREE.Vector3(0, 1, 0));


scene.add(padmiddle);
scene.add(padleft);
scene.add(padright);
scene.add(boxmiddle);

boxes.push(boxmiddle);

boxmiddle.position.y = 0.55;
boxmiddle.position.z = 0;

padmiddle.position.z = 3;

padleft.position.x = 1;
padleft.position.z = 3;

padright.position.x = -1;
padright.position.z = 3;

camera.position.z = 6.5;
camera.position.y = 3.5;
camera.rotation.x = -1 * Math.PI / 10;

document.body.addEventListener('keydown', keyPressed);
document.body.addEventListener('keyup', keyReleased);

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

let time = 0;

function boxhit(key, box, pad){
    if (key && box.object.name == "longbox") {
        let newbox = 0;
        if ((box.object.position.z + box.object.scale.z) - pad.position.z >= 0.02){
            boxes.push(createLongBox(0xff2062));
            newbox = boxes.length - 1;
            boxes[newbox].position.y = 0.55;
            boxes[newbox].position.x = box.object.position.x;
            boxes[newbox].position.z = box.object.position.z - ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
            boxes[newbox].scale.z = box.object.scale.z - ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
            if (!remains) {
                tabremains.push(createLongBox(0xff2062));
                let nlength = tabremains.length - 1;
                tabremains[nlength].position.x = box.object.position.x;
                tabremains[nlength].position.y = 0.55;
                tabremains[nlength].scale.z = ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
                tabremains[nlength].position.z = pad.position.z + ((box.object.position.z + box.object.scale.z) - pad.position.z) / 2;
                console.log(tabremains[nlength].position.z);
                scene.add(tabremains[nlength]);
                remains = true;
            }
            scene.add(boxes[newbox]);
            boxes.splice(boxes.indexOf(box.object), 1);
            scene.remove(box.object);
        }
        if (box.object.scale.z <= 0.1) {
            boxes.splice(boxes.indexOf(box.object), 1);
            scene.remove(box.object);
        }
    } else {
        boxes.splice(boxes.indexOf(box.object), 1);
        scene.remove(box.object);
    }
}

function animate(){
    timer.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    for (let i = 0; i < tabremains.length; i++) {
        tabremains[i].position.z += 0.01;
        if ( tabremains[i].position.z >= 10){
            scene.remove( tabremains[i]);
            tabremains.splice(i, 1);
        }
    }

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].position.z += 0.01;
        if (boxes[i].position.z >= 10){
            scene.remove(boxes[i]);
            boxes.splice(i, 1);
        }
    }
    let tabintersect = [];
    tabintersect.push(raycasterpadm.intersectObjects(boxes, true));
    tabintersect.push(raycasterpadl.intersectObjects(boxes, true));
    tabintersect.push(raycasterpadr.intersectObjects(boxes, true));
    for (let j = 0; j < tabintersect.length; j++){
        for (let i = 0; i < tabintersect[j].length; i++) {
            if (j == 0 && middlepressed){
                boxhit(middlepressed, tabintersect[j][i], padmiddle);
            } else if (j == 2 && leftpressed) {
                boxhit(leftpressed, tabintersect[j][i], padright);
            } else if (j == 1 && rightpressed) {
                boxhit(rightpressed, tabintersect[j][i], padright);
            }
        }
    }
    time += timer.getDelta();
    if (time > 4){
        let randombox = randInt(0, 1);
        if (randombox)
            boxes.push(createLongBox(0xff2062));
        else
            boxes.push(createBox(0xff2062))
        scene.add(boxes[boxes.length - 1]);
        boxes[boxes.length - 1].position.y = 0.55;
        boxes[boxes.length - 1].position.x = randInt(-1,1);
        time = 0;
    }
}
animate();