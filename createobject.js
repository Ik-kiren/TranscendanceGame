import * as THREE from 'three';

function createBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    let boxmesh = new THREE.MeshToonMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "box";
    return box;
}

function createLongBox(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 1, 2, 1, 1, 1);
    let boxmesh = new THREE.MeshToonMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "longbox";
    return box;
}

function createRapidBox(_color){
    const geometry = new THREE.CapsuleGeometry( 0.4, 1.5, 4, 8 ); 
    const material = new THREE.MeshToonMaterial( {color: _color} ); 
    const capsule = new THREE.Mesh( geometry, material );
    capsule.rotation.set(Math.PI / 2, 0, 0);
    capsule.name = "rapidbox";
    return capsule;
}

function createPad(_color) {
    let boxgeometry = new THREE.BoxGeometry(1, 0.1, 1, 1, 1, 1);
    let boxmesh = new THREE.MeshToonMaterial({color: _color});
    let box = new THREE.Mesh(boxgeometry, boxmesh);
    box.name = "pad";
    return box;
}

export {createBox, createLongBox, createPad, createRapidBox};