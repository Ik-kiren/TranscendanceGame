import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/Addons.js';
import { Timer } from 'three/addons/misc/Timer.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { EventManager } from './events.js';

import Pad from './Pad.js';
export default class GameManager {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({antialias: true});
    rendererScene;
    composer;
    bloomPass;

    event = new EventManager();

    road;
    roads = [];

    controls = new OrbitControls(this.camera, this.renderer.domElement);

    light = new THREE.PointLight(0xffffff, 100, 1000);

    padMiddle = new Pad();
    padLeft = new Pad();
    padRight = new Pad();

    timer = new Timer();

    boxes = [];
    boxParams = {
        speed : 0.04,
        positionY : 0.8,
        spawnPosition : 0
    }

    spawnTimer = 3;
    score = 0;
    rapidBoxBool = false;
    inversion = 1;

    remains = false;

    collisionTime = 0;
    time = 0;

    scoreAnim = false;
    scoreJump = 0;
    scoreToAdd = 0;

    blackHole;

    box;

    longBox;
    longBoxAnim;
    longBoxAnimBool = false;

    pad;

    songposinbeat = 0;

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
            0.5,
            1.1,
            1.5
        );
        this.composer.addPass(this.bloomPass);
        this.clockAnim = new THREE.Clock();
        this.currentAnim = undefined;
    }

    cleanBlocks() {
        for (let i = 0; i < this.boxes.length; i++) {
            //this.boxes[i][0].position.z += this.boxParams.speed * this.inversion;
            if (this.boxes[i][0].position.z >= 10 || this.boxes[i][0].position.z <= -3){
                this.scene.remove(this.boxes[i][0]);
                this.boxes.splice(i, 1);
            }
        }
    }

    longboxHit(box){
        box.position.z -= this.boxParams.speed * this.inversion;
        if (this.currentAnim == undefined){
            this.currentAnim = new THREE.AnimationMixer(box);
            this.currentAnim.addEventListener('finished', (e) => {this.currentAnim = undefined,this.scene.remove(box), console.log(this.currentAnim)});
            const action = this.currentAnim.clipAction(this.longBoxAnim);
            action.clampWhenFinished = true;
            action.setEffectiveTimeScale(2);
            action.setLoop(THREE.LoopOnce);
            action.play();
        }
        else (this.currentAnim != undefined)
            this.currentAnim.update(this.clockAnim.getDelta());
    }

    rapidboxhit(box) {
        this.scoreAnim = true;
        this.scoreToAdd += 10;
        if (box.scale.z < 0.2) {
            this.scene.remove(box);
            for (let i = 0; i < this.boxes.length; i++) {
                if (this.boxes[i][0] == box) {
                    this.boxes.splice(i, 1);
                }
            }
        }
        else {
            box.scale.set(box.scale.x, box.scale.y, box.scale.z - 0.09);
        }
    }

    boxHit(key, box, pad){
        this.collisionTime = 0;
        if (key && box.name == "longbox") {
            this.longboxHit(box, pad);
        } else if (key && box.name == "rapidbox" && !this.rapidBoxBool) {
            this.rapidboxhit(box);
            this.rapidBoxBool = true;
        } else if (box.name == "box") {
            console.log(box.position.z);
            console.log(this.songposinbeat);
            for (let i = 0; i < this.boxes.length; i++) {
                if (this.boxes[i][0] == box) {
                    this.boxes.splice(i, 1);
                }
            }
            this.scene.remove(box);
            this.scoreAnim = true;
            this.scoreToAdd += 10;
        }
    }

    checkCollision(box, pad){
        let maxSize;
        let minSize;
        let position;
        if (box.name == "box") {
            maxSize = 0.1;
            minSize = -0.1;
            position = box.position.z;
        } else if (box.name == "longbox") {
            maxSize = (box.children[0].children[1].geometry.boundingBox.max.z - box.children[0].children[1].geometry.boundingBox.min.z) / 2;
            minSize = maxSize * -1;
            position = box.position.z;
        } else if (box.name == "rapidbox") {
            maxSize = box.geometry.parameters.length / 2;
            minSize = -1 * (box.geometry.parameters.length / 2);
            position = box.position.z;
        }
        let sizePad = pad.children[0].children[0].geometry.boundingBox.max.z - pad.children[0].children[0].geometry.boundingBox.min.z;
        for (let i = minSize; i <= maxSize; i += 0.1) {
            if ((position + i > (pad.position.z - sizePad / 8) && position + i < (pad.position.z + sizePad / 8)) && box.position.x == pad.position.x) {
                return true;
            }
        }
        return false;
    }

    checkSameX(obj, obj2) {
        if (obj.position.x == obj2.position.x)
            return true;
        return false;
    }

    collisionBlocksPads() {
        for (let i = 0; i < this.boxes.length; i++) {
            if (((this.event.leftPressed && !this.checkCollision(this.boxes[i][0], this.padLeft.pad) && this.checkSameX(this.boxes[i][0], this.padLeft.pad)) || (this.event.middlePressed && !this.checkCollision(this.boxes[i][0], this.padMiddle.pad) && this.checkSameX(this.boxes[i][0], this.padMiddle.pad)) || (this.event.rightPressed && !this.checkCollision(this.boxes[i][0], this.padRight.pad) && this.checkSameX(this.boxes[i][0], this.padRight.pad))) && this.collisionTime >= 0.7){
                this.wrongHit = true;
                if (this.score > 9)
                    this.score -= 10;
                this.collisionTime = 0;
            }
            if (this.checkCollision(this.boxes[i][0], this.padMiddle.pad) && this.event.middlePressed && !this.wrongHit){
                this.boxHit(this.event.middlePressed, this.boxes[i][0], this.padMiddle.pad);
            } else if (this.checkCollision(this.boxes[i][0], this.padLeft.pad) && this.event.leftPressed && !this.wrongHit) {
                this.boxHit(this.event.leftPressed, this.boxes[i][0], this.padLeft.pad);
            } else if (this.checkCollision(this.boxes[i][0], this.padRight.pad) && this.event.rightPressed && !this.wrongHit) {
                this.boxHit(this.event.rightPressed, this.boxes[i][0], this.padRight.pad);
            }
        }
    }
}
