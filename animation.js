import {gameManager} from "./main.js";

export function addScoreAnim() {
    if (gameManager.scoreJump < gameManager.scoreToAdd) {
        gameManager.event.cameraAnimationT += gameManager.event.cameraAnimationC.getDelta();
        if (gameManager.event.cameraAnimationT >= 0.03) {
            gameManager.score++;
            gameManager.scoreJump++;
            gameManager.event.cameraAnimationT = 0;
        }
    }
    if (gameManager.scoreJump == gameManager.scoreToAdd) {
        gameManager.scoreJump = 0;
        gameManager.scoreToAdd = 0;
        gameManager.scoreAnim = false;
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