import { gameManager } from "./main.js";

function inverseSpeed () {
    
    gameManager.inversion *= -1;
    gameManager.cameraAnim = true;
    //gameManager.camera.position.z -= gameManager.inversion;
    if (gameManager.inversion == -1)
        gameManager.boxParams.spawnPosition = 6;
    else
        gameManager.boxParams.spawnPosition = 0;
}

export function keyReleased(e) {
    if (e.key == 'k')
        gameManager.middlePressed = false;
    if (e.key == 'j')
        gameManager.leftPressed = false;
    if (e.key == 'l')
        gameManager.rightPressed = false;
    gameManager.keymap.delete(e.key);
    gameManager.remains = false;
    gameManager.wrongHit = false;
    gameManager.rapidBoxBool = false;
}
export function keyPressed(e) {
    gameManager.keymap.add(e.key);
    for (let key of gameManager.keymap){
        console.log(key);
        switch (key) {
            case 'k':
                gameManager.middlePressed = true;
                break;
            case 'j':
                gameManager.leftPressed = true;
                break;
            case 'l':
                gameManager.rightPressed = true;
                break;
            case 'p':
                inverseSpeed();
                break;
        }
    }
}