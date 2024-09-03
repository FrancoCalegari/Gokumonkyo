// inventory.js

let inventory = [];

document.addEventListener('DOMContentLoaded', (event) => {
    // Añadir evento para mostrar/ocultar el inventario
    const inventoryButton = document.getElementById('inventory-button');
    inventoryButton.addEventListener('click', toggleInventory);

    // Cargar inventario desde el cache
    loadInventory();
});

function showInventory() {
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = inventory.map(habilidad => `
        <div class="inventory-item" data-id="${habilidad.id}">
            <p><strong>Nombre:</strong> <span contenteditable="true" class="editable">${habilidad.name}</span></p>
            <p><strong>Raresa:</strong> <span contenteditable="true" class="editable">${habilidad.raresa}</span></p>
            <button class="remove-button">Eliminar</button>
            <button class="save-button">Guardar</button>
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

    // Añadir evento para guardar modificaciones
    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.parentElement.getAttribute('data-id');
            const itemElement = event.target.parentElement;
            const newName = itemElement.querySelector('span.editable:nth-of-type(1)').innerText;
            const newRaresa = itemElement.querySelector('span.editable:nth-of-type(2)').innerText;
            updateInventory(itemId, newName, newRaresa);
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
    showInventory();
}

function updateInventory(id, newName, newRaresa) {
    const habilidad = inventory.find(habilidad => habilidad.id === id);
    if (habilidad) {
        habilidad.name = newName;
        habilidad.raresa = newRaresa;
        saveInventory();
        showInventory();
    }
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
