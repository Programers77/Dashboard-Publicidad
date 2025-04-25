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

    // Función para encontrar la fila de total
    function encontrarFilaTotal() {
        return document.querySelector('.total-row') ||
            document.querySelector('tr:has(td:has(i.fa-calculator))');
    }

    // Función para actualizar los totales
    function actualizarTotales() {
        const filaTotal = encontrarFilaTotal();
        if (!filaTotal) return;

        // Inicializar sumas
        const sumasMeses = Array(12).fill(0);
        let sumaTotal = 0;

        // Calcular sumas de todas las filas (excepto el total)
        const filas = tablaCampanasBody.querySelectorAll('tr:not(.total-row)');
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td.amount-cell');
            celdas.forEach((celda, index) => {
                if (index < 12) { // Solo los meses
                    const valor = parseFloat(celda.textContent.replace(/[^\d.-]/g, '')) || 0;
                    sumasMeses[index] += valor;
                }
            });
        });

        // Suma general
        sumaTotal = sumasMeses.reduce((a, b) => a + b, 0);

        // Actualizar la fila de total
        const celdasTotal = filaTotal.querySelectorAll('td.amount-cell');
        sumasMeses.forEach((suma, index) => {
            if (celdasTotal[index]) {
                celdasTotal[index].textContent = `$${suma.toFixed(2)}`;
                // Actualizar barra de progreso si existe
                const barra = celdasTotal[index].querySelector('.value-bar');
                if (barra) {
                    const porcentaje = suma > 0 ? 100 : 0;
                    barra.style.width = `${porcentaje}%`;
                }
            }
        });

        // Actualizar total general
        const celdaTotalGeneral = filaTotal.querySelector('.grand-total');
        if (celdaTotalGeneral) {
            celdaTotalGeneral.textContent = `$${sumaTotal.toFixed(2)}`;
            const barraTotal = celdaTotalGeneral.querySelector('.value-bar');
            if (barraTotal) {
                barraTotal.style.width = '100%';
            }
        }
    }

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
        const filaTotal = encontrarFilaTotal();

        if (crearNuevaRadio.checked) {
            if (!nombreCampana) {
                alert('Por favor, ingrese el nombre de la nueva campaña.');
                return;
            }

            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td><i class="fas fa-bullhorn me-2" style="color: #6f42c1"></i>${nombreCampana}</td>
                ${Array(12).fill('<td class="amount-cell zero">$0.00</td>').join('')}
                <td class="amount-cell zero">$0.00</td>
            `;

            // Insertar antes del total
            if (filaTotal) {
                tablaCampanasBody.insertBefore(nuevaFila, filaTotal);
            } else {
                tablaCampanasBody.appendChild(nuevaFila);
            }
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
                ${Array(12).fill('<td class="amount-cell zero">$0.00</td>').join('')}
                <td class="amount-cell zero">$0.00</td>
            `;

            // Insertar antes del total
            if (filaTotal) {
                tablaCampanasBody.insertBefore(nuevaFila, filaTotal);
            } else {
                tablaCampanasBody.appendChild(nuevaFila);
            }
        }

        // Actualizar totales
        actualizarTotales();

        const modal = bootstrap.Modal.getInstance(document.getElementById('agregarCampanaModal'));
        modal.hide();

        nombreCampanaInput.value = '';
        tipoCampanaSelect.value = '';
        toggleInputs();
    });

    // Inicializar
    toggleInputs();

    // Asegurarse de que los totales estén actualizados al cargar
    actualizarTotales();
});