function createRoad(gameManager, position, i) {
    gameManager.scene.remove(gameManager.roads[i]);
    gameManager.roads.splice(gameManager.roads.indexOf(gameManager.roads[i]), 1);
    const nextRoad = gameManager.road.clone();
    gameManager.roads.push(nextRoad);
    nextRoad.scale.set(1,1,0.8);
    nextRoad.position.z = gameManager.roads[i].position.z + position;
    nextRoad.rotation.y = Math.PI / 2;
    gameManager.scene.add(nextRoad);
}

export function manageRoads(gameManager) {
    for (let i = 0; i < gameManager.roads.length; i++) {
        if (gameManager.roads[i].position.z > 255) {
           createRoad(gameManager, -255, i);
        }
        if (gameManager.roads[i].position.z < -255) {
            createRoad(gameManager, 255, i);
        }
        gameManager.roads[i].position.z += 0.07 * gameManager.inversion;
    }
}