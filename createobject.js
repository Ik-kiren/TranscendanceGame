import * as THREE from 'three';
import { gameManager } from './main';

function createBox(gameManager) {
    let box = gameManager.box.clone();
    box.scale.set(0.0035, 0.0035, 0.0035);
    box.name = "box";
    return box;
}

function createLongBox(gameManager, size) {
    let longBox = gameManager.longBox.clone();
    longBox.scale.set(0.25, 0.25, 0.25 * size);
    if(gameManager.inversion == -1)
            longBox.rotation.set(0, Math.PI, 0);
    longBox.name = "longbox";
    return longBox;
}

function createRapidBox(_color){
    const geometry = new THREE.CapsuleGeometry( 0.4, 1.5, 4, 8 );
    const material = new THREE.MeshToonMaterial( {color: _color} ); 
    const capsule = new THREE.Mesh( geometry, material );
    capsule.rotation.set(Math.PI / 2, 0, 0);
    capsule.name = "rapidbox";
    return capsule;
}

export {createBox, createLongBox, createRapidBox};