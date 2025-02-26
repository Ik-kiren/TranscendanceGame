import * as THREE from '../lib/three.module.min.js';
export default class Player {
    constructor(username) {
        this.username = username;
        this.score = 0;
        this.scoreToAdd = 0;
        this.scoreJump = 0;
        this.scoreAnimTimer = 0;
        this.scoreAnimClock = new THREE.Clock();
    }
}