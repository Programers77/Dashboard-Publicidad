document.addEventListener('DOMContentLoaded', function() {
    // 1. Funciones para manejar datos de la API
    function formatCurrency(value) {
        return '$' + parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function updateCards(data) {
        // Actualizar tarjeta de presupuesto total
        const presupuestoCard = document.querySelector('#presupuesto_total .card-value');
        const gastadoTrend = document.querySelector('#presupuesto_total .trend-value');
        
        presupuestoCard.textContent = `$${data.presupuesto_total}`;
        gastadoTrend.textContent = `Gastado: $${data.gastado} (${data.porcentaje.toFixed(2)}%)`;
      
        // Actualizar tarjeta de restante
        const restanteCard = document.querySelector('#restante .card-value');
        restanteCard.textContent = `$${data.restante}`;
      
        // Actualizar tarjeta de mes más frecuente
        const mesesEnEspanol = {
            'January': 'Enero', 'February': 'Febrero', 'March': 'Marzo',
            'April': 'Abril', 'May': 'Mayo', 'June': 'Junio',
            'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre',
            'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre'
        };
        
        const mesCard = document.querySelector('#mes_mas_frecuente .card-value');
        const mesTrend = document.querySelector('#mes_mas_frecuente .trend-value');
        
        const mesEnEspanol = mesesEnEspanol[data.mes_masfrecuente.mes] || data.mes_masfrecuente.mes;
        mesCard.textContent = mesEnEspanol;
        
        // Calcular el porcentaje que representa el mes más frecuente del total gastado
        const gastadoNumerico = parseFloat(data.gastado.replace(/,/g, ''));
        const porcentajeMes = (data.mes_masfrecuente.Cuenta / gastadoNumerico) * 100;
        mesTrend.textContent = `$${data.mes_masfrecuente.Cuenta.toLocaleString('en-US')} (${porcentajeMes.toFixed(1)}%)`;
    }

    function updateCampanasTable(campanasData) {
        const tableBody = document.querySelector('#tablaCampanas tbody');
        tableBody.innerHTML = ''; // Limpiar tabla existente

        // Procesar cada tipo de campaña
        Object.entries(campanasData).forEach(([nombre, meses], index) => {
            const row = document.createElement('tr');
            row.style.setProperty('--row-order', index);

            // Calcular el total de la campaña
            const total = meses.reduce((sum, value) => sum + value, 0);

            // Crear celda de descripción
            const descCell = document.createElement('td');
            descCell.innerHTML = `
                <div class="category-wrapper">
                    <i class="fab fa-${nombre.toLowerCase()} icon-category"></i>
                    CAMPAÑAS ${nombre.toUpperCase()}
                </div>
            `;

            // Crear celdas de meses
            const monthCells = meses.map(value => {
                const cell = document.createElement('td');
                if (value === 0) {
                    cell.className = 'amount-cell zero';
                    cell.textContent = '$0.00';
                } else {
                    cell.className = 'amount-cell';
                    cell.innerHTML = `
                        ${formatCurrency(value)}
                        <div class="value-bar" style="width: ${(value / Math.max(...meses.filter(v => v > 0)) * 100 || 0)}%"></div>
                    `;
                }
                return cell;
            });

            // Crear celda de total
            const totalCell = document.createElement('td');
            totalCell.className = 'amount-cell';
            totalCell.innerHTML = `
                ${formatCurrency(total)}
                <div class="value-bar" style="width: 100%"></div>
            `;

            // Construir la fila
            row.appendChild(descCell);
            monthCells.forEach(cell => row.appendChild(cell));
            row.appendChild(totalCell);

            tableBody.appendChild(row);
        });

        // Agregar fila de totales
        addTotalRow(campanasData);
        
        // Añadir interactividad a las filas después de crearlas
        addRowInteractivity();
    }

    function addTotalRow(campanasData) {
        const tableBody = document.querySelector('#tablaCampanas tbody');
        const row = document.createElement('tr');
        row.className = 'total-row';
        row.style.setProperty('--row-order', Object.keys(campanasData).length);

        // Calcular totales por mes
        const mesesTotales = Array(12).fill(0);
        Object.values(campanasData).forEach(meses => {
            meses.forEach((value, index) => {
                mesesTotales[index] += value;
            });
        });

        // Calcular gran total
        const granTotal = mesesTotales.reduce((sum, value) => sum + value, 0);

        // Crear celda de descripción
        const descCell = document.createElement('td');
        descCell.innerHTML = `
            <div class="category-wrapper">
                <i class="fas fa-calculator icon-category"></i>
                TOTALES
            </div>
        `;

        // Crear celdas de meses
        const monthCells = mesesTotales.map(value => {
            const cell = document.createElement('td');
            if (value === 0) {
                cell.className = 'amount-cell zero';
                cell.textContent = '$0.00';
            } else {
                cell.className = 'amount-cell';
                cell.innerHTML = `
                    ${formatCurrency(value)}
                    <div class="value-bar" style="width: ${(value / Math.max(...mesesTotales.filter(v => v > 0)) * 100 || 0)}%"></div>
                `;
            }
            return cell;
        });

        // Crear celda de gran total
        const totalCell = document.createElement('td');
        totalCell.className = 'amount-cell grand-total';
        totalCell.innerHTML = `
            ${formatCurrency(granTotal)}
            <div class="value-bar" style="width: 100%"></div>
        `;

        // Construir la fila
        row.appendChild(descCell);
        monthCells.forEach(cell => row.appendChild(cell));
        row.appendChild(totalCell);

        tableBody.appendChild(row);
    }

    // 2. Funciones para interactividad de la tabla
    function addRowInteractivity() {
        const rows = document.querySelectorAll('#tablaCampanas tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(247, 37, 133, 0.05)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    }

    // 3. Función para agregar nueva campaña
    function agregarNuevaCampana(nombreCampana) {
        const fechaActual = new Date().toISOString().split('T')[0];
        
        const datos = {
            "nombre_campañas": nombreCampana,
            "fecha_creacion": fechaActual,
            "activa": true
        };
        
        fetch('http://10.100.39.23:8000/campanas/apihead/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            nuevaCampanaId = data.id;
            
            // Cierra el modal de campaña
            const modalCampana = bootstrap.Modal.getInstance(document.getElementById('agregarCampanaModal'));
            modalCampana.hide();
            
            // Recarga los datos para actualizar la vista
            cargarDatosAPI().then(() => {
                // Muestra SweetAlert de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Campaña registrada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                // Abre el modal de gastos después de actualizar
                const modalGastos = new bootstrap.Modal(document.getElementById('agregarGastosModal'));
                modalGastos.show();
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar la campaña: ' + error.message
            });
        });
    }

    // Función para cargar datos de la API
    function cargarDatosAPI() {
        return fetch('http://10.100.39.23:8000/campanas/apidescrip/resumencampanas/')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                updateCards(data);
                
                if (data.campanas) {
                    updateCampanasTable(data.campanas);
                }
                return data; // Devuelve los datos para poder encadenar
            })
            .catch(error => {
                console.error('Error al obtener datos de la API:', error);
                throw error; // Propaga el error
            });
    }
    
    // Variable para guardar el ID de la campaña recién creada
    let nuevaCampanaId = null;

     // Función para limpiar el modal
     function limpiarModal() {
        document.getElementById('nombreCampana').value = '';
    }

    // Event listeners para cuando los modales se cierran
    document.getElementById('agregarCampanaModal').addEventListener('hidden.bs.modal', function() {
        limpiarModal('agregarCampanaModal');
    });
    
    document.getElementById('agregarGastosModal').addEventListener('hidden.bs.modal', function() {
        limpiarModal('agregarGastosModal');
    });

    // Función para agregar nueva campaña (modificada)
    function agregarNuevaCampana(nombreCampana) {
        const fechaActual = new Date().toISOString().split('T')[0];
        
        const datos = {
            "nombre_campañas": nombreCampana,
            "fecha_creacion": fechaActual,
            "activa": true
        };
        
        fetch('http://10.100.39.23:8000/campanas/apihead/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            nuevaCampanaId = data.id; // Guardamos el ID de la nueva campaña
            
            // Cierra el modal de campaña y abre el de gastos
            const modalCampana = bootstrap.Modal.getInstance(document.getElementById('agregarCampanaModal'));
            modalCampana.hide();
            
            const modalGastos = new bootstrap.Modal(document.getElementById('agregarGastosModal'));
            modalGastos.show();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al registrar la campaña: ' + error.message);
        });
    }
    
    function registrarGastos() {
        // Verificar que SweetAlert está disponible
        if (typeof Swal === 'undefined') {
            console.error('SweetAlert2 no está cargado correctamente');
            alert('Error de configuración del sistema');
            return;
        }
    
        const formGastos = document.getElementById('formGastos');
        if (!formGastos) {
            console.error('No se encontró el formulario de gastos');
            return;
        }
    
        if (!formGastos.checkValidity()) {
            formGastos.reportValidity();
            return;
        }
    
        // Obtener valores de forma segura
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : null;
        };
    
        const datosGastos = {
            fecha_pago: getValue('fechaPago'),
            tipo_evento: getValue('tipoEvento'),
            tipo_contendido: getValue('tipoContenido'),
            duracion: parseInt(getValue('duracion')) || 0,
            alcance: parseInt(getValue('alcance')) || 0,
            inversion: parseFloat(getValue('inversion')) || 0,
            head_id: nuevaCampanaId
        };
    
        // Validación adicional
        if (!datosGastos.head_id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se ha seleccionado una campaña válida',
                confirmButtonClass: 'btn btn-primary'
            });
            return;
        }
    
        // Mostrar loader
        Swal.fire({
            title: 'Registrando gastos...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    
        fetch('http://10.100.39.23:8000/campanas/apidescrip/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosGastos)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || `Error del servidor: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Gastos registrados correctamente',
                confirmButtonClass: 'btn btn-primary'
            }).then(() => {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('agregarGastosModal'));
                if (modal) modal.hide();
                
                // Limpiar backdrop
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                
                // Recargar datos
                cargarDatosAPI();
            });
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonClass: 'btn btn-primary'
            });
        });
    }
    
    // Event listener para el botón de guardar campaña
    document.getElementById('guardarCampanaBtn').addEventListener('click', function() {
        const nombreCampana = document.getElementById('nombreCampana').value.trim();
        
        if (nombreCampana === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa un nombre para la campaña',
                confirmButtonClass: 'btn btn-primary'
            });
            return;
        }
        
        agregarNuevaCampana(nombreCampana);
    });
    
    document.getElementById('guardarGastosBtn').addEventListener('click', function() {
        // Validación básica
        if (!document.getElementById('formGastos').checkValidity()) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        registrarGastos();
    });
    // Cargar datos iniciales
    cargarDatosAPI();
});