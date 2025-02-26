import {gameManager} from "./main.js";
import * as THREE from '../lib/three.module.min.js';

let bhTimer = 0;
let bhClock = new THREE.Clock();

export function blackHoleAnim(blackHole, direction) {
    bhTimer += bhClock.getDelta();
    if (blackHole.position.z > -12 && direction == -1) {
        if (bhTimer >= 0.09) {
            blackHole.position.z -= 0.01;
            bhTimer = 0;
        }
    } else if (blackHole.position.z < -4 && direction == 1) {
        if (bhTimer >= 0.03) {
            blackHole.position.z += 0.01;
            bhTimer = 0
        }
    }
}

export function addScoreAnim(player) {
    if (player.scoreJump < player.scoreToAdd) {
        player.scoreAnimTimer += player.scoreAnimClock.getDelta();
        if (player.scoreAnimTimer >= 0.03) {
            player.score++;
            player.scoreJump++;
            player.scoreAnimTimer = 0;
        }
    } else if (player.scoreJump > player.scoreToAdd && player.score > 0) {
        player.scoreAnimTimer += player.scoreAnimClock.getDelta();
        if (player.scoreAnimTimer >= 0.03) {
            player.score--;
            player.scoreJump--;
            player.scoreAnimTimer = 0;
        }
    }
    if (player.scoreJump == player.scoreToAdd) {
        player.scoreJump = 0;
        player.scoreToAdd = 0;
    }
}

function buttonAnimationPressed(currentPad) {
    currentPad.padTimer += currentPad.padClock.getDelta();
    if (currentPad.pad.position.y > 0.05) {
        if (currentPad.padTimer >= 0.01) {
            currentPad.pad.position.y -= 0.01;
            currentPad.padTimer = 0;
        }
    }
}

function buttonAnimationReleased(currentPad) {
    currentPad.padTimer += currentPad.padClock.getDelta();
    if (currentPad.pad.position.y < 0.1) {
        if (currentPad.padTimer >= 0.01) {
            currentPad.pad.position.y += 0.01;
            currentPad.padTimer = 0;
        }
    }
}

export function checkButtonAnim() {
    if (gameManager.event.middlePressed) {
        buttonAnimationPressed(gameManager.padMiddle);
        gameManager.padMiddle.pad.children[0].children[0].material.emissive = gameManager.padMiddle.emissiveColorPressed;
        gameManager.padMiddle.pad.children[0].children[0].material.emissiveIntensity = 9;
    } else {
        buttonAnimationReleased(gameManager.padMiddle);
        gameManager.padMiddle.pad.children[0].children[0].material.emissive = gameManager.padMiddle.emissiveColorReleased;
        gameManager.padMiddle.pad.children[0].children[0].material.emissiveIntensity = 2.9;
    }
    if (gameManager.event.rightPressed) {
        buttonAnimationPressed(gameManager.padRight);
        gameManager.padRight.pad.children[0].children[0].material.emissive = gameManager.padRight.emissiveColorPressed;
        gameManager.padRight.pad.children[0].children[0].material.emissiveIntensity = 9;
    } else {
        buttonAnimationReleased(gameManager.padRight);
        gameManager.padRight.pad.children[0].children[0].material.emissive = gameManager.padRight.emissiveColorReleased;
        gameManager.padRight.pad.children[0].children[0].material.emissiveIntensity = 2.9;
    }
    if (gameManager.event.leftPressed) {
        buttonAnimationPressed(gameManager.padLeft);
        gameManager.padLeft.pad.children[0].children[0].material.emissive = gameManager.padLeft.emissiveColorPressed;
        gameManager.padLeft.pad.children[0].children[0].material.emissiveIntensity = 9;
    } else {
        buttonAnimationReleased(gameManager.padLeft);
        gameManager.padLeft.pad.children[0].children[0].material.emissive = gameManager.padLeft.emissiveColorReleased;
        gameManager.padLeft.pad.children[0].children[0].material.emissiveIntensity = 2.9;
    }
}

export function animation() {

    if (gameManager.inversion == -1 && gameManager.camera.position.z < 7.2) {
        gameManager.event.cameraAnimationT += gameManager.event.cameraAnimationC.getDelta();
        if (gameManager.event.cameraAnimationT >= 0.01) {
            gameManager.camera.position.z  += 0.1;
            gameManager.event.cameraAnimationT = 0;
        }
        gameManager.camera.fov = 90;
        gameManager.camera.updateProjectionMatrix();
    }
    else if (gameManager.inversion == 1 && gameManager.camera.position.z > 6.5) {
        gameManager.event.cameraAnimationT += gameManager.event.cameraAnimationC.getDelta();
        if (gameManager.event.cameraAnimationT >= 0.01) {
            gameManager.camera.position.z  -= 0.1;
            gameManager.event.cameraAnimationT = 0;
        }
        gameManager.camera.fov = 70;
        gameManager.camera.updateProjectionMatrix();
    }
    else {
        gameManager.event.cameraAnim = false;
    }
}