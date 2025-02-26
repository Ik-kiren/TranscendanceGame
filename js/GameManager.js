import * as THREE from '../lib/three.module.min.js';
import { Timer } from '../lib/three.timer.min.js';
import { RenderPass } from '../lib/RenderPass.js';
import { EffectComposer } from '../lib/three.effectcomposer.min.js';
import { UnrealBloomPass } from '../lib/UnrealBloomPass.js';
import { EventManager } from './events.js';
import { createBox, createLongBox, createRapidBox } from './createobject.js';
import { addScoreAnim } from './animation.js';
import Audio from './Audio.js';

import Pad from './Pad.js';
export default class GameManager {

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.CineonToneMapping;
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

        this.players = [];
        this.choosedSong = 2;

        this.event = new EventManager();

        this.road;
        this.roads = [];

        this.light = new THREE.PointLight(0xffffff, 100, 1000);

        this.padMiddle = new Pad();
        this.padLeft = new Pad();
        this.padRight = new Pad();

        this.timer = new Timer();

        this.boxes = [];
        this.boxParams = {
            speed: 0.04,
            positionY: 0.8,
            spawnPosition: 0
        }

        this.spawnTimer = 3;
        this.score = 0;

        this.rapidBoxBool = false;
        
        this.inversion = 1;
        this.modSize = false;
        this.modHardcore = false;

        this.remains = false;

        this.collisionTime = 0;
        this.time = 0;

        this.scoreJump = 0;
        this.scoreToAdd = 0;

        this.blackHole;
        this.blackHoleAnim = 0;

        this.box;

        this.longBox;
        this.longBoxAnim;
        this.longBoxAnimBool = false;

        this.pad;

        this.boxesAnim = [];
        this.scoreNotation = "perfect";

        this.clockAnim = new THREE.Clock();
        this.currentAnim = [];
        this.wrongHit = false;
        this.audio = new Audio(this.choosedSong);
        this.audio.loadMusic(this.choosedSong);
        this.isRunning = true;

        this.mouse = new THREE.Vector2();
        this.mouseRaycaster = new THREE.Raycaster();
    }

    playmusic() {
        if (this.audio.music.source != undefined && this.audio.music.context.currentTime >= this.audio.music.source.buffer.duration) {
            this.isRunning = false;
        }
        if (this.audio.music.isPlaying) {
            this.bloomPass.strength = 0.3 + (this.audio.analyzer.getAverageFrequency() / 200);
            this.audio.lastsp = this.audio.songposinbeat;
            this.audio.songposinbeat = (this.audio.music.context.currentTime + this.audio.music.offset) / this.audio.secperbeat;
            this.audio.timerBeat = this.audio.songposinbeat - this.audio.lastsp;
            if (this.audio.music.isPlaying && this.audio.nextNote < this.audio.currentSong.length && this.audio.currentSong[this.audio.nextNote][0] <= this.audio.songposinbeat + 3) {
                this.spawnBlocks(this.audio.currentSong[this.audio.nextNote]);
                this.audio.nextNote++;
            }
            for (let i = 0; i < this.boxes.length; i++) {
                if (!(this.boxes[i][0].name == "longbox" && ((this.checkCollision(this.boxes[i][0], this.padLeft.pad) && this.event.leftPressed) || (this.checkCollision(this.boxes[i][0], this.padMiddle.pad) && this.event.middlePressed) || (this.checkCollision(this.boxes[i][0], this.padRight.pad) && this.event.rightPressed))) && this.inversion != -1) {
                    this.boxes[i][0].position.lerpVectors(new THREE.Vector3(this.boxes[i][1][1], this.boxParams.positionY, 0), new THREE.Vector3(this.boxes[i][1][1], this.boxParams.positionY, 3), (3 - (this.boxes[i][1][0] - this.audio.songposinbeat)) / 3);
                } else if (!(this.boxes[i][0].name == "longbox" && ((this.checkCollision(this.boxes[i][0], this.padLeft.pad) && this.event.leftPressed) || (this.checkCollision(this.boxes[i][0], this.padMiddle.pad) && this.event.middlePressed) || (this.checkCollision(this.boxes[i][0], this.padRight.pad) && this.event.rightPressed))) && this.inversion == -1) {
                    this.boxes[i][0].position.lerpVectors(new THREE.Vector3(this.boxes[i][1][1], this.boxParams.positionY, 6), new THREE.Vector3(this.boxes[i][1][1], this.boxParams.positionY, 3), (3 - (this.boxes[i][1][0] - this.audio.songposinbeat)) / 3);
                }
            }
        }
    }

    spawnBlocks(nextNote) {
        if (nextNote[2] >= 1)
            this.boxes.push([createLongBox(this, nextNote[2]), nextNote]);
        else
            this.boxes.push([createBox(this), nextNote]);
        this.boxes[this.boxes.length - 1][0].position.z = this.boxParams.spawnPosition;
        this.boxes[this.boxes.length - 1][0].position.y = this.boxParams.positionY;
        this.boxes[this.boxes.length - 1][0].position.x = this.boxes[this.boxes.length - 1][1][1];
        this.scene.add(this.boxes[this.boxes.length - 1][0]);
        this.time = 0;
    }

    cleanBlocks() {
        for (let i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i][0].position.z >= 10 || this.boxes[i][0].position.z <= -23 || !this.isRunning) {
                this.scene.remove(this.boxes[i][0]);
                this.boxes.splice(i, 1);
            }
        }
    }

    longboxHit(box) {
        if (this.boxesAnim.indexOf(box) == -1) {
            this.currentAnim.push(new THREE.AnimationMixer(box));
            this.currentAnim[this.currentAnim.length - 1].timer = 0;
            this.currentAnim[this.currentAnim.length - 1].addEventListener('finished', (e) => {
                this.scene.remove(box);
                this.boxesAnim.splice(this.boxesAnim.indexOf(box), 1);
                for (let j = 0; j < this.boxes.length; j++) {
                    if (this.boxes[j][0] == box) {
                        this.boxes.splice(j, 1);
                        break;
                    }
                }
                let i = 0;
                for (; i < this.currentAnim.length; i++) {
                    if (this.currentAnim[i].clipAction(this.longBoxAnim))
                        break;
                };
                this.currentAnim.splice(i, 1);
            });
            const action = this.currentAnim[this.currentAnim.length - 1].clipAction(this.longBoxAnim);
            action.clampWhenFinished = true;
            action.setEffectiveTimeScale(0.5 / box.scale.z);
            action.setLoop(THREE.LoopOnce);
            action.play();
            this.boxesAnim.push(box);
        } else {
            for (let i = 0; i < this.currentAnim.length; i++) {
                this.currentAnim[i].update(this.audio.timerBeat);
                if (this.currentAnim[i]) {
                    const currentAction = this.currentAnim[i].clipAction(this.longBoxAnim);
                    if (currentAction.time >= this.currentAnim[i].timer) {
                        this.players[0].scoreToAdd += 1;
                        this.currentAnim[i].timer += 0.1;
                    }
                }
            }
        }
    }

    rapidboxhit(box) {
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

    boxHit(key, box, pad) {
        console.log(this.audio.songposinbeat);
        this.collisionTime = 0;
        if (this.inversion == -1)
            this.blackHoleAnim = -1;
        if (key && box.name == "longbox") {
            this.longboxHit(box, pad);
        } else if (key && box.name == "rapidbox" && !this.rapidBoxBool) {
            this.rapidboxhit(box);
            this.rapidBoxBool = true;
        } else if (box.name == "box") {
            for (let i = 0; i < this.boxes.length; i++) {
                if (this.boxes[i][0] == box) {
                    this.boxes.splice(i, 1);
                }
            }
            this.scene.remove(box);
            if (this.scoreNotation == "good") {
                if (this.modHardcore) {
                    this.players[0].scoreToAdd += 2;
                } else {
                    this.players[0].scoreToAdd += 5;
                }
            } else if (this.scoreNotation == "perfect") {
                if (this.modHardcore) {
                    this.players[0].scoreToAdd += 5;
                } else {
                    this.players[0].scoreToAdd += 10;
                }
            }
        }
    }

    checkCollision(box, pad) {
        let maxSize;
        let minSize;
        let position;
        if (box.name == "box") {
            maxSize = 0.075;
            minSize = -0.075;
            position = box.position.z;
        } else if (box.name == "longbox") {
            maxSize = (box.children[0].children[1].geometry.boundingBox.max.z - box.children[0].children[1].geometry.boundingBox.min.z) / 8;
            minSize = maxSize * -1;
            position = box.position.z;
        } else if (box.name == "rapidbox") {
            maxSize = box.geometry.parameters.length / 2;
            minSize = -1 * (box.geometry.parameters.length / 2);
            position = box.position.z;
        }
        let sizePad = pad.children[0].children[0].geometry.boundingBox.max.z - pad.children[0].children[0].geometry.boundingBox.min.z;
        for (let i = minSize; i <= maxSize; i += 0.1) {
            if ((position + i > (pad.position.z - sizePad / 3) && position + i < (pad.position.z + sizePad / 3)) && box.position.x == pad.position.x) {
                if (position + i > (pad.position.z - sizePad / 5) &&
                    ((this.event.middlePressed && pad.position.x == 0) || (this.event.leftPressed && pad.position.x == -1) ||
                        (this.event.rightPressed && pad.position.x == 1)))
                    this.scoreNotation = "perfect";
                else if (position + i < (pad.position.z - sizePad / 5) &&
                    ((this.event.middlePressed && pad.position.x == 0) || (this.event.leftPressed && pad.position.x == -1)
                        || (this.event.rightPressed && pad.position.x == 1)))
                    this.scoreNotation = "good";
                return true;
            }
        }
        return false;
    }

    collisionBlocksPads() {
        for (let i = 0; i < this.boxes.length; i++) {
            if (this.checkCollision(this.boxes[i][0], this.padMiddle.pad) && this.event.middlePressed) {
                this.padMiddle.augmentSize(this.modSize);
                this.boxHit(this.event.middlePressed, this.boxes[i][0], this.padMiddle.pad);
            } else if (this.checkCollision(this.boxes[i][0], this.padLeft.pad) && this.event.leftPressed) {
                this.padLeft.augmentSize(this.modSize);
                this.boxHit(this.event.leftPressed, this.boxes[i][0], this.padLeft.pad);
            } else if (this.checkCollision(this.boxes[i][0], this.padRight.pad) && this.event.rightPressed) {
                this.padRight.augmentSize(this.modSize);
                this.boxHit(this.event.rightPressed, this.boxes[i][0], this.padRight.pad);
            }
            if (((this.event.leftPressed && this.boxes[i][0].position.x == -1 && !this.checkCollision(this.boxes[i][0], this.padLeft.pad))
                || (this.event.middlePressed && this.boxes[i][0].position.x == 0 && !this.checkCollision(this.boxes[i][0], this.padMiddle.pad))
                || (this.event.rightPressed && this.boxes[i][0].position.x == 1 && !this.checkCollision(this.boxes[i][0], this.padRight.pad)))
                && this.collisionTime >= 0.4) {
                this.wrongHit = true;
                if (this.event.leftPressed)
                    this.padLeft.reduceSize(this.modSize);
                if (this.event.middlePressed)
                    this.padMiddle.reduceSize(this.modSize);
                if (this.event.rightPressed)
                    this.padRight.reduceSize(this.modSize);
                if (this.players[0].score > 9) {
                    if (this.modHardcore)
                        this.players[0].scoreToAdd -= 15;
                    else
                        this.players[0].scoreToAdd -= 10;
                }
                this.collisionTime = 0;
                if (this.inversion == -1)
                    this.blackHoleAnim = 1;
                this.scoreNotation = "missed";
            }
        }
    }

    checkPlayersScore() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].scoreToAdd != 0) {
                addScoreAnim(this.players[i]);
            }
        }
    }
}
