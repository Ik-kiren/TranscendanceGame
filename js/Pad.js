import * as THREE from '../lib/three.module.min.js';

export default class Pad {
    constructor() {
        this.pad;
        this.padTimer = 0;
        this.padClock = new THREE.Clock();
        this.emissiveColorPressed;
        this.emissiveColorReleased;
    }

    augmentSize(modSizeBool) {
        if (modSizeBool) {
            if (this.pad.children[0].children[0].geometry.boundingBox.max.z <= 0.70) {
                this.pad.children[0].children[0].geometry.boundingBox.max.z += 0.02;
                this.pad.children[0].children[0].geometry.boundingBox.min.z += 0.02;
                this.pad.scale.z += 0.02;
            }
        }
    }

    reduceSize(modSizeBool) {
        if (modSizeBool) {
            if (this.pad.children[0].children[0].geometry.boundingBox.max.z >= 0.29) {
                this.pad.children[0].children[0].geometry.boundingBox.max.z -= 0.02;
                this.pad.children[0].children[0].geometry.boundingBox.min.z -= 0.02;
                this.pad.scale.z -= 0.02;
            }
        }
    }
}