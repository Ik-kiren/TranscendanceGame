import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { Timer } from 'three/addons/misc/Timer.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';


import {createLongBox} from './createobject.js';
import Pad from './Pad.js';
export default class GameManager {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({antialias: true});
    rendererScene;
    composer;
    bloomPass;

    roads = [];

    controls = new OrbitControls(this.camera, this.renderer.domElement);

    light = new THREE.PointLight(0xffffff, 100, 1000);

    padMiddle = new Pad(0x00ff00);
    padLeft = new Pad(0xff0000);
    padRight = new Pad(0x0000ff);

    timer = new Timer();

    keymap = new Set();

    boxes = [];
    tabRemains = [];
    boxParams = {
        speed : 0.02,
        positionY : 0.55,
        spawnPosition : 0
    }

    spawnTimer = 3;
    score = 0;
    rapidBoxBool = false;
    inversion = 1;

    middlePressed = false;
    rightPressed = false;
    leftPressed = false;

    remains = false;

    collisionTime = 0;
    time = 0;
    
    cameraAnim = false;
    cameraAnimationC = new THREE.Clock(true);
    cameraAnimationT = 0;

    scoreAnim = false;
    scoreJump = 0;
    scoreToAdd = 0;

    blackHole;

    constructor() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.CineonMapping;
        this.renderer.toneMappingExposure = 1;
        document.body.appendChild(this.renderer.domElement);
        this.rendererScene = new RenderPass(this.scene, this.camera);
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(this.rendererScene);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.4,
            1.1,
            1.5
        );
        this.composer.addPass(this.bloomPass);
    }

    cleanBlocks() {
        for (let i = 0; i < this.tabRemains.length; i++) {
            this.tabRemains[i].position.z += this.boxParams.speed * this.inversion;
            if (this.tabRemains[i].position.z >= 10 || this.tabRemains[i].position.z <= -3){
                this.scene.remove( this.tabRemains[i]);
                this.tabRemains.splice(i, 1);
            }
        }
    
        for (let i = 0; i < this.boxes.length; i++) {
            this.boxes[i].position.z += this.boxParams.speed * this.inversion;
            if (this.boxes[i].position.z >= 10 || this.boxes[i].position.z <= -3){
                this.scene.remove(this.boxes[i]);
                this.boxes.splice(i, 1);
            }
        }
    }

    longboxHit(box, pad){
        let newBox = 0;
        this.boxes.push(createLongBox(0xff2062));
        newBox = this.boxes.length - 1;
        this.boxes[newBox].position.y = this.boxParams.positionY;
        this.boxes[newBox].position.x = box.object.position.x;
        console.log((((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) * this.inversion));
        this.boxes[newBox].position.z = box.object.position.z - ((((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) / 2));
        this.boxes[newBox].scale.z = box.object.scale.z - ((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) * this.inversion / 2;
        if (!this.remains && ((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) * this.inversion >= 0.01) {
            this.tabRemains.push(createLongBox(0xff2062));
            let newRemains = this.tabRemains.length - 1;
            this.tabRemains[newRemains].position.x = box.object.position.x;
            this.tabRemains[newRemains].position.y = this.boxParams.positionY;
            this.tabRemains[newRemains].scale.z = ((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) * this.inversion / 2;
            this.tabRemains[newRemains].position.z = pad.position.z + (((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) / 2);
            this.scene.add(this.tabRemains[newRemains]);
            this.remains = true;
        }
        this.scene.add(this.boxes[newBox]);
        this.scene.remove(box.object);
        this.boxes.splice(this.boxes.indexOf(box.object), 1);
        this.score += 1;
    }

    rapidboxhit(box) {
        this.scoreAnim = true;
        this.scoreToAdd += 10;
        if (box.object.scale.z < 0.2) {
            this.scene.remove(box.object);
            this.boxes.splice(this.boxes.indexOf(box.object), 1);
        }
        else {
            box.object.scale.set(box.object.scale.x, box.object.scale.y, box.object.scale.z - 0.09);
        }
    }

    boxHit(key, box, pad){
        this.collisionTime = 0;
        if (key && box.object.name == "longbox") {
            if (box.object.scale.z >= 0.1 && ((box.object.position.z + box.object.scale.z * this.inversion) - pad.position.z) * this.inversion > 0.01){
                this.longboxHit(box, pad)
            }
            if (box.object.scale.z <= 0.1) {
                this.scene.remove(box.object);
                this.boxes.splice(this.boxes.indexOf(box.object), 1);
            }
        } else if (key && box.object.name == "rapidbox" && !this.rapidBoxBool) {
            this.rapidboxhit(box);
            this.rapidBoxBool = true;
        } else if (box.object.name == "box") {
            this.scene.remove(box.object);
            this.boxes.splice(this.boxes.indexOf(box.object), 1);
            this.scoreAnim = true;
            this.scoreToAdd += 10;
        }
    }

    collisionBlocksPads(tabintersect) {
        tabintersect.push(this.padMiddle.raycaster.intersectObjects(this.boxes, true));
        tabintersect.push(this.padLeft.raycaster.intersectObjects(this.boxes, true));
        tabintersect.push(this.padRight.raycaster.intersectObjects(this.boxes, true));
        if (((this.leftPressed && tabintersect[1].length == 0)|| (this.middlePressed && tabintersect[0].length == 0) || (this.rightPressed && tabintersect[2].length == 0)) && this.collisionTime >= 0.7){
            this.wrongHit = true;
            if (this.score > 9)
                this.score -= 10;
            this.collisionTime = 0;
        }
        for (let j = 0; j < tabintersect.length; j++){
            for (let i = 0; i < tabintersect[j].length; i++) {
                if (j == 0 && this.middlePressed && !this.wrongHit){
                    this.boxHit(this.middlePressed, tabintersect[j][i], this.padMiddle.pad);
                } else if (j == 1 && this.leftPressed && !this.wrongHit) {
                    this.boxHit(this.leftPressed, tabintersect[j][i], this.padLeft.pad);
                } else if (j == 2 && this.rightPressed && !this.wrongHit) {
                    this.boxHit(this.rightPressed, tabintersect[j][i], this.padRight.pad);
                }
            }
        }
    }
}
