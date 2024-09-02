let scene, camera, renderer, dice;
let isSpinning = false;
let spinSpeed = 0.01;
let accelerationFactor = 1.1; // Factor de aceleración exponencial
let decelerationFactor = 0.9; // Factor de desaceleración exponencial
let maxSpinSpeed = 0.5;
let currentSpinSpeed = spinSpeed;
let flashSprite;
let inventory = [];

function init() {
    
    // Configuración básica de la escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('dado-container').appendChild(renderer.domElement);


    // Crear el cubemap
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

    // Crear el dado
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

    // Añadir evento de click
    renderer.domElement.addEventListener('click', spinDice);

    // Añadir una luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Crear un sprite para el destello
    const spriteMaterial = new THREE.SpriteMaterial({ color: 0xffffff });
    flashSprite = new THREE.Sprite(spriteMaterial);
    flashSprite.scale.set(2, 2, 1); // Tamaño del sprite
    flashSprite.visible = false; // Inicialmente invisible
    scene.add(flashSprite);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);

        if (!isSpinning) {
            dice.rotation.x += spinSpeed;
            dice.rotation.y += spinSpeed;
        }

        renderer.render(scene, camera);
    }
    animate();

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', onWindowResize, false);

     // Cargar inventario desde el cache
     loadInventory();

     // Añadir evento para mostrar el inventario
     document.getElementById('inventory-button').addEventListener('click', showInventory);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function spinDice() {
    if (isSpinning) return;
    isSpinning = true;

    let spinDuration = 5000; // Duración del giro en milisegundos
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
        <p><strong>Raresa:</strong> <span style="color:${getRaresaColor(habilidad.raresa)}">${habilidad.raresa}</span></p>
    `;

    // Aplicar destello al dado
    applyFlash(getRaresaColor(habilidad.raresa));

    // Ejecutar animación
    eval(habilidad.animacion);

    // Guardar habilidad en el inventario
    addToInventory(habilidad);

    // Aplicar destello al dado
    applyFlash(getRaresaColor(habilidad.raresa));

    // Ejecutar animación
    eval(habilidad.animacion);
}

function addToInventory(habilidad) {
    if (inventory.length >= 5) {
        inventory.shift(); // Eliminar el ítem más antiguo
    }
    inventory.push(habilidad);
    saveInventory();
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function loadInventory() {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        inventory = JSON.parse(storedInventory);
    }
}

function showInventory() {
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = inventory.map(habilidad => `
        <div class="inventory-item" data-id="${habilidad.id}">
            <p>${habilidad.name}</p>
            <p>Raresa: <span style="color:${getRaresaColor(habilidad.raresa)}">${habilidad.raresa}</span></p>
            <button class="remove-button">Eliminar</button>
        </div>
    `).join('');

    // Añadir evento para eliminar habilidades del inventario
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.parentElement.getAttribute('data-id');
            removeFromInventory(itemId);
            showInventory();
        });
    });
}

function removeFromInventory(id) {
    inventory = inventory.filter(habilidad => habilidad.id !== id);
    saveInventory();
}


function getRaresaColor(raresa) {
    switch(raresa) {
        case 'mítico': return 'red';
        case 'legendario': return 'yellow';
        case 'épico': return 'green';
        case 'raro': return 'blue';
        case 'normal': return 'grey';
        default: return 'black';
    }
}

function applyFlash(color) {
    // Cambiar el color del sprite
    flashSprite.material.color.set(color);
    flashSprite.position.copy(dice.position);
    flashSprite.visible = true;

    // Animar el destello del sprite
    let intensity = 1;
    const flashInterval = setInterval(() => {
        intensity -= 0.05;
        flashSprite.material.opacity = intensity;

        if (intensity <= 0) {
            clearInterval(flashInterval);
            flashSprite.visible = false;
        }
    }, 55);
}

init();
