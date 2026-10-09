// Monster Configuration
const monsterData = {
    mesh: null,          // Monster ka 3D object/mesh
    speedNormal: 0.03,   // Jab player door ho ya chup ho
    speedChase: 0.06,    // Jab monster player ko dekh le (Dangerous!)
    detectionRange: 12,  // Kitne distance par monster player ko detect karega
    attackRange: 1.5     // Jumpscare / Game over distance
};

// Monster Mesh Setup (Example Red Glowing Box or Custom Model)
const monsterGeometry = new THREE.BoxGeometry(1, 2, 1);
const monsterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const monster = new THREE.Mesh(monsterGeometry, monsterMaterial);
monster.position.set(10, 1, 10);
scene.add(monster);

function updateMonsterAI(playerCamera, wallsArray) {
    if (!gameStarted) return;

    // 1. Distance Calculation between Monster and Player
    const distanceToPlayer = monster.position.distanceTo(playerCamera.position);

    // 2. State Switch: Normal patrol vs Direct Chase
    let currentSpeed = monsterData.speedNormal;

    if (distanceToPlayer < monsterData.detectionRange) {
        // Line of Sight check ya direct tracking
        currentSpeed = monsterData.speedChase; 
        
        // Monster look at player smoothly (Y-axis locked so monster doesn't tilt up/down)
        const targetPos = new THREE.Vector3(playerCamera.position.x, monster.position.y, playerCamera.position.z);
        monster.lookAt(targetPos);

        // Move towards player
        monster.translateZ(currentSpeed);
    } else {
        // Random wandering or idle behavior when player is safe
        // Yahan tum apna purana patrol path ya random movement daal sakte ho
    }

    // 3. Attack / Jumpscare Trigger
    if (distanceToPlayer < monsterData.attackRange) {
        triggerJumpscare();
    }
}

function triggerJumpscare() {
    alert("GAME OVER! The monster caught you.");
    // Reset player position or reload game state
    location.reload();
}
