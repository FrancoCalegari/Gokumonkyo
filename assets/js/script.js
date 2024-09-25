let scene, camera, renderer, dice, particleSystem;
let isSpinning = false;
let spinSpeed = 0.01;
let accelerationFactor = 1.1;
let decelerationFactor = 0.9;
let maxSpinSpeed = 0.5;
let currentSpinSpeed = spinSpeed;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('dado-container').appendChild(renderer.domElement);

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './assets/textures/red_dark_posx.jpg',
        './assets/textures/red_dark_negx.jpg',
        './assets/textures/red_dark_posy.jpg',
        './assets/textures/red_dark_negy.jpg',
        './assets/textures/red_dark_posz.jpg',
        './assets/textures/red_dark_negz.jpg'
    ]);
    scene.background = texture;

    const geometry = new THREE.BoxGeometry();
    const diceLoader = new THREE.TextureLoader();

    const materials = [
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice1.png') }),
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice2.png') }),
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice3.png') }),
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice4.png') }),
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice5.png') }),
        new THREE.MeshBasicMaterial({ map: diceLoader.load('./assets/textures/dice6.png') })
    ];

    dice = new THREE.Mesh(geometry, materials);
    scene.add(dice);

    camera.position.z = 3;

    renderer.domElement.addEventListener('click', onDiceClick);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Crear un sistema de partículas
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2; // X
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2; // Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // Z

        colors[i * 3] = 1; // R
        colors[i * 3 + 1] = 1; // G
        colors[i * 3 + 2] = 1; // B
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0
    });

    particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    function animate() {
        requestAnimationFrame(animate);

        if (!isSpinning) {
            dice.rotation.x += spinSpeed;
            dice.rotation.y += spinSpeed;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDiceClick() {
    animateScaleDown();
    setTimeout(() => {
        animateScaleUp();
        spinDice();
    }, 300);
}

function animateScaleDown() {
    new TWEEN.Tween(dice.scale)
        .to({ x: 0.8, y: 0.8, z: 0.8 }, 300)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

function animateScaleUp() {
    new TWEEN.Tween(dice.scale)
        .to({ x: 1, y: 1, z: 1 }, 300)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

function spinDice() {
    if (isSpinning) return;
    isSpinning = true;

    let spinDuration = 5000;
    let startTime = Date.now();

    function accelerate() {
        if (Date.now() - startTime < spinDuration) {
            currentSpinSpeed = Math.min(maxSpinSpeed, currentSpinSpeed * accelerationFactor);
            dice.rotation.x += currentSpinSpeed;
            dice.rotation.y += currentSpinSpeed;
            requestAnimationFrame(accelerate);
        } else {
            slowDownDice();
        }
    }
    accelerate();
}

function slowDownDice() {
    function decelerate() {
        if (currentSpinSpeed > spinSpeed) {
            currentSpinSpeed = Math.max(spinSpeed, currentSpinSpeed * decelerationFactor);
            dice.rotation.x += currentSpinSpeed;
            dice.rotation.y += currentSpinSpeed;
            requestAnimationFrame(decelerate);
        } else {
            isSpinning = false;
            mostrarHabilidadAleatoria();
        }
    }
    decelerate();
}

async function mostrarHabilidadAleatoria() {
    const response = await fetch('./assets/json/skilss.json');
    const habilidades = await response.json();
    const habilidad = habilidades[Math.floor(Math.random() * habilidades.length)];

    document.getElementById('habilidad-container').innerHTML = `
        <p><strong>ID:</strong> ${habilidad.id}</p>
        <p><strong>Nombre:</strong> ${habilidad.name}</p>
        <p><strong>Personaje:</strong> ${habilidad.personaje}</p>
        <p><strong>Rareza:</strong> <span style="color:${getRaresaColor(habilidad.raresa)}">${habilidad.raresa}</span></p>
    `;

    // Aplicar el efecto de flash
    applyFlash(getRaresaColor(habilidad.raresa));

    // Ejecutar animación
    eval(habilidad.animacion);

    // Guardar habilidad en el inventario
    addToInventory(habilidad);
}

function getRaresaColor(raresa) {
    switch(raresa) {
        case 'mítico': return 'red';
        case 'legendario': return 'yellow';
        case 'épico': return 'violet';
        case 'raro': return 'green';
        case 'normal': return 'grey';
        default: return 'black';
    }
}

function applyFlash(color) {
    const particleMaterial = particleSystem.material;
    particleMaterial.color.set(color);
    particleSystem.material.opacity = 1; // Asegúrate de que sea visible

    // Animar las partículas
    let duration = 500; // Duración del flash
    let startTime = Date.now();

    function updateParticles() {
        let elapsed = Date.now() - startTime;

        // Reduce la opacidad con el tiempo
        particleMaterial.opacity = Math.max(0, 1 - elapsed / duration);

        // Mover las partículas hacia afuera
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1; // X
            positions[i + 1] += (Math.random() - 0.5) * 0.1; // Y
            positions[i + 2] += (Math.random() - 0.5) * 0.1; // Z
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        if (elapsed < duration) {
            requestAnimationFrame(updateParticles);
        } else {
            // Desactivar las partículas al final del efecto
            particleMaterial.opacity = 0;
        }
    }
    updateParticles();
}

// Actualizar TWEEN en cada frame
function update() {
    requestAnimationFrame(update);
    TWEEN.update();
}

init();
update();
