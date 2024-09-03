// inventory.js

let inventory = [];

document.addEventListener('DOMContentLoaded', (event) => {
    // Añadir evento para mostrar/ocultar el inventario
    const inventoryButton = document.getElementById('inventory-button');
    inventoryButton.addEventListener('click', toggleInventory);

    // Cargar inventario desde el cache
    loadInventory();
    showInventory(); // Mostrar el inventario al cargar
});

function showInventory() {
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = inventory.map(habilidad => `
        <div class="inventory-item" data-id="${habilidad.id}">
            <p><strong>Nombre:</strong> ${habilidad.name}</p>
            <p><strong>Personaje:</strong> ${habilidad.personaje}</p>
            <p><strong>Raresa:</strong> <span style="color:${getRaresaColor(habilidad.raresa)}">${habilidad.raresa}</span></p>
            <button class="remove-button">Eliminar</button>
        </div>
    `).join('');

    // Añadir evento para eliminar habilidades del inventario
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = parseInt(event.target.parentElement.getAttribute('data-id'));
            removeFromInventory(itemId);
        });
    });
}

function toggleInventory() {
    const inventoryContainer = document.getElementById('inventory-container');
    if (inventoryContainer.style.display === 'none' || inventoryContainer.style.display === '') {
        showInventory();
        inventoryContainer.style.display = 'block';
    } else {
        inventoryContainer.style.display = 'none';
    }
}

function addToInventory(habilidad) {
    if (inventory.length >= 5) {
        inventory.shift(); // Eliminar el ítem más antiguo
    }
    inventory.push(habilidad);
    saveInventory();
    showInventory(); // Refrescar la visualización del inventario
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

function removeFromInventory(id) {
    inventory = inventory.filter(habilidad => habilidad.id !== id);
    saveInventory();
    showInventory(); // Refrescar la visualización del inventario
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
