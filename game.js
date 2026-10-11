let gameStarted = false;
let mouseSensitivity = 1.0;
let audioEnabled = true;

let scene, camera, renderer;
let monster;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// UI Functions
function openSettings() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('settings-screen').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function updateSensitivity(val) {
    mouseSensitivity = parseFloat(val);
    document.getElementById('sens-val').innerText = val;
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    document.getElementById('audio-btn').innerText = audioEnabled ? "Audio: ON" : "Audio: OFF";
}

function startGame() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    gameStarted = true;
    prevTime = performance.now(); // Fix: Reset time right when game starts to prevent huge delta jumps
    initThreeJS();
}

// Three.js Setup
function initThreeJS() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.08);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff3300, 1, 15);
    pointLight.position.set(0, 2, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    const wallGeo = new THREE.BoxGeometry(4, 4, 0.5);

    for (let i = -10; i <= 10; i += 5) {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(i, 2, -5);
        wall.castShadow = true;
        scene.add(wall);
    }

    const monsterGeo = new THREE.BoxGeometry(1, 2, 1);
    const monsterMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    monster = new THREE.Mesh(monsterGeo, monsterMat);
    monster.position.set(8, 1, -8);
    scene.add(monster);

    setupControls();
    window.addEventListener('resize', onWindowResize);
    animate();
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = true;
    });

    document.addEventListener('keyup', (e) => {
        if (!gameStarted) return;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = false;
    });

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    document.addEventListener('mousedown', () => { isDragging = true; });
    document.addEventListener('mouseup', () => { isDragging = false; });

    document.addEventListener('mousemove', (e) => {
        if (!gameStarted || !isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        camera.rotation.y -= deltaX * 0.003 * mouseSensitivity;
    });

    window.addEventListener('mousemove', (e) => {
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
}

function onWindowResize() {
    if (!gameStarted) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (!gameStarted) return;

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

    camera.translateX(velocity.x * delta);
    camera.translateZ(velocity.z * delta);

    // Smart Monster AI Logic
    const distanceToPlayer = monster.position.distanceTo(camera.position);
    let monsterSpeed = 0.02;

    if (distanceToPlayer < 12) {
        monsterSpeed = 0.045;
        const targetPos = new THREE.Vector3(camera.position.x, monster.position.y, camera.position.z);
        monster.lookAt(targetPos);
        monster.translateZ(monsterSpeed);
    }

    if (distanceToPlayer < 1.2) {
        alert("GAME OVER! The monster caught you.");
        location.reload();
    }

    prevTime = time;
    renderer.render(scene, camera);
}
