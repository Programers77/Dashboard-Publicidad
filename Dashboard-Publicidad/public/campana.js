// Script para hacer la tabla más interactiva
document.addEventListener('DOMContentLoaded', function() {
    // Añadir funcionalidad para resaltar filas al pasar el ratón
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(247, 37, 133, 0.05)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
});


// Script para manejar la creación de nuevas campañas

document.addEventListener('DOMContentLoaded', function () {
    const crearNuevaRadio = document.getElementById('crearNueva');
    const usarExistenteRadio = document.getElementById('usarExistente');
    const nombreCampanaInput = document.getElementById('nombreCampana');
    const tipoCampanaSelect = document.getElementById('tipoCampana');
    const guardarCampanaBtn = document.getElementById('guardarCampanaBtn');
    const tablaCampanasBody = document.getElementById('tablaCampanas').querySelector('tbody');

    // Mapeo de iconos por tipo de campaña
    const iconosPorTipo = {
        'ads': 'fa-bullseye',
        'redes': 'fa-google',
        'email': 'fa-envelope',
        'evento': 'fa-calendar-alt',
        'influencer': 'fa-user-tie',
        'seo': 'fa-search',
        'otro': 'fa-tags'
    };

    // Mapeo de colores por tipo de campaña
    const coloresPorTipo = {
        'ads': '#4285F4', // Azul
        'redes': '#DB4437', // Rojo
        'email': '#F4B400', // Amarillo
        'evento': '#0F9D58', // Verde
        'influencer': '#AB47BC', // Morado
        'seo': '#607D8B', // Gris
        'otro': '#FF7043' // Naranja
    };

    function toggleInputs() {
        if (crearNuevaRadio.checked) {
            nombreCampanaInput.disabled = false;
            tipoCampanaSelect.disabled = true;
            nombreCampanaInput.value = '';
        } else {
            nombreCampanaInput.disabled = true;
            tipoCampanaSelect.disabled = false;
            nombreCampanaInput.value = '';
        }
    }

    crearNuevaRadio.addEventListener('change', toggleInputs);
    usarExistenteRadio.addEventListener('change', toggleInputs);

    guardarCampanaBtn.addEventListener('click', function () {
        const tipoCampana = tipoCampanaSelect.value;
        const nombreCampana = nombreCampanaInput.value.trim();

        if (crearNuevaRadio.checked) {
            if (!nombreCampana) {
                alert('Por favor, ingrese el nombre de la nueva campaña.');
                return;
            }

            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                    <td><i class="fas fa-bullhorn me-2" style="color: #6f42c1"></i>${nombreCampana}</td>
                `;
            tablaCampanasBody.appendChild(nuevaFila);
        } else {
            if (!tipoCampana) {
                alert('Por favor, seleccione una campaña existente.');
                return;
            }

            const nombreExistente = tipoCampanaSelect.options[tipoCampanaSelect.selectedIndex].text;
            const icono = iconosPorTipo[tipoCampana] || 'fa-tag';
            const color = coloresPorTipo[tipoCampana] || '#666666';

            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                    <td><i class="fas ${icono} me-2" style="color: ${color}"></i>${nombreExistente}</td>
                `;
            tablaCampanasBody.appendChild(nuevaFila);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('agregarCampanaModal'));
        modal.hide();

        nombreCampanaInput.value = '';
        tipoCampanaSelect.value = '';
        toggleInputs();
    });

    // Inicializar
    toggleInputs();
});

