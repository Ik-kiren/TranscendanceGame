import { gameManager } from "./main.js";
import * as THREE from 'three';

export class EventManager {
    constructor(){
        this.cameraAnim = false;
        this.cameraAnimationC = new THREE.Clock(true);
        this.cameraAnimationT = 0;

        this.middlePressed = false;
        this.rightPressed = false;
        this.leftPressed = false;

        this.keymap = new Set();
    }

    inverseSpeed () {
        
        gameManager.inversion *= -1;
        this.cameraAnim = true;
        //gameManager.camera.position.z -= gameManager.inversion;
        if (gameManager.inversion == -1) {
            gameManager.boxParams.spawnPosition = 10;
            gameManager.scene.add(gameManager.blackHole);
        }
        else {
            gameManager.boxParams.spawnPosition = 0;
            gameManager.scene.remove(gameManager.blackHole);
        }
        for (let i = 0; i < gameManager.boxes.length; i++) {
            gameManager.scene.remove(gameManager.boxes[i][0]);   
        }
    }

    keyReleased(e) {
        if (e.key == 'k')
            this.middlePressed = false;
        if (e.key == 'j')
            this.leftPressed = false;
        if (e.key == 'l')
            this.rightPressed = false;
        this.keymap.delete(e.key);
        gameManager.remains = false;
        gameManager.wrongHit = false;
        gameManager.rapidBoxBool = false;
    }

    keyPressed(e) {
        this.keymap.add(e.key);
        for (let key of this.keymap){
            console.log(key);
            switch (key) {
                case 'k':
                    this.middlePressed = true;
                    break;
                case 'j':
                    this.leftPressed = true;
                    break;
                case 'l':
                    this.rightPressed = true;
                    break;
                case 'p':
                    this.inverseSpeed();
                    break;
            }
        }
    }
}