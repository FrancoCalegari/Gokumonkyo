import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, dice;

function init() {
    // Configuración básica de la escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 400);
    document.getElementById('dado-container').appendChild(renderer.domElement);

    // Crear el dado
    const geometry = new THREE.BoxGeometry();
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff }),
        new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    ];
    dice = new THREE.Mesh(geometry, materials);
    scene.add(dice);

    // Añadir controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.z = 5;

    // Añadir evento de click
    renderer.domElement.addEventListener('click', mostrarHabilidadAleatoria);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        dice.rotation.x += 0.01;
        dice.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
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

    // Ejecutar animación
    eval(habilidad.animacion);
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

init();
