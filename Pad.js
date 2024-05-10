import * as THREE from 'three';


export default class Pad {
    pad;
    raycaster;
    constructor(_color) {
        let boxgeometry = new THREE.BoxGeometry(1, 0.1, 1, 1, 1, 1);
        let boxmesh = new THREE.MeshToonMaterial({color: _color});
        this.pad = new THREE.Mesh(boxgeometry, boxmesh);
        this.pad.name = "pad";
        this.raycaster = new THREE.Raycaster(this.pad.position, new THREE.Vector3(0, 1, 0));
    }
}