import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pad = new THREE.BoxGeometry(0.5, 1, 1);
const ball = new THREE.SphereGeometry(0.2, 16, 16);
const greenmaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
const redmaterial = new THREE.MeshBasicMaterial( {color:0xff0000} );
const bluematerial = new THREE.MeshBasicMaterial( {color:0x0000ff} );
const padleft = new THREE.Mesh( pad, redmaterial);
const padright = new THREE.Mesh( pad, bluematerial);
const ballmesh = new THREE.Mesh(ball, greenmaterial);
scene.add( padleft);
scene.add( padright);
scene.add( ballmesh );
camera.position.z = 7;
camera.position.y = 2;
padleft.position.x = -3;
padright.position.x = 3;
document.body.addEventListener('keydown', keyPressed);
document.body.addEventListener('keyup', keyReleased);
var ballspeed = 0.02;
var ballspeedy = 0;

const raycasterpr = new THREE.Raycaster(ballmesh.position, new THREE.Vector3(1,0,0));
const raycasterpl = new THREE.Raycaster(ballmesh.position, new THREE.Vector3(-1,0,0));

const map = new Set();

function keyReleased(e) {
    map.delete(e.key);

}

function keyPressed(e) {
    map.add(e.key);
    console.log(map);
    for (let i = 0; i < map.size; i++) {
        console.log(map.has('ArrowUp'));
        if (map.has('ArrowUp'))
            padright.position.y += 0.05;
        if (map.has('ArrowDown'))
            padright.position.y -= 0.05;
        if (map.has('w'))
            padleft.position.y += 0.05;
        if (map.has('s'))
            padleft.position.y -= 0.05;
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render( scene, camera );
    /*if (((ballmesh.position.x <= padleft.position.x + 0.25 && ballmesh.position.x >= padleft.position.x - 0.25) && ballmesh.position.y <= padright.position.y) ||
        ((ballmesh.position.x <= padright.position.x + 0.25 && ballmesh.position.x >= padright.position.x - 0.25) && ballmesh.position.y >= padright.position.y)) {
        ballspeed *= -1;
    }*/
    const intersectspr = raycasterpr.intersectObject(padright);

    for ( let i = 0; i < intersectspr.length; i ++ ) {
		if(Math.round(intersectspr[ i ].distance) == 0 && ballspeed > 0){
            console.log(Math.round(intersectspr[ i ].distance));
            ballspeed += 0.01;
            ballspeed *= -1;
            ballspeedy = 0.01;
            console.log(ballspeed);
        }
	}
    const intersectspl = raycasterpl.intersectObject(padleft);
    for ( let i = 0; i < intersectspl.length; i ++ ) {
		if(Math.round(intersectspl[ i ].distance) == 0 && ballspeed < 0){
            console.log(Math.round(intersectspl[ i ].distance));
            ballspeed -= 0.001;
            ballspeed *= -1;
            ballspeedy = 0.01;
            intersectspl[i].object.getObjectByProperty(color, );
            console.log(ballspeed);
        }
	}
    if (ballmesh.position.x <= -5 || ballmesh.position.x >= 5){
        ballmesh.position.x = 0;
        ballmesh.position.y = 0;
        ballspeed = 0.01;
        ballspeedy = 0;
        console.log("game over");
    }
    if ((ballmesh.position.y <= -2 && ballspeedy < 0) || (ballmesh.position.y >= 2 && ballspeedy > 0)){
        ballspeedy *= -1;
    }
    ballmesh.position.x += ballspeed;
    ballmesh.position.y += ballspeedy;
}
animate();