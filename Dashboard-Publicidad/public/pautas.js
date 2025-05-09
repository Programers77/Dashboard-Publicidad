document.addEventListener('DOMContentLoaded', function() {
    // 1. Funcionalidad básica del modal
    const btnAddPauta = document.getElementById('btnAddPauta');
    const pautaModal = document.getElementById('pautaModal');
    const closeModal = document.getElementById('closeModal');
    const cancelPauta = document.getElementById('cancelPauta');
    const pautaForm = document.getElementById('pautaForm');
    
    // Abrir modal
    if(btnAddPauta) {
        btnAddPauta.addEventListener('click', function() {
            pautaModal.classList.add('active');
            cargarModelos(); // Cargar modelos cuando se abre el modal
        });
    }
    
    // Cerrar modal
    function closeModalHandler() {
        pautaModal.classList.remove('active');
    }
    
    if(closeModal) closeModal.addEventListener('click', closeModalHandler);
    if(cancelPauta) cancelPauta.addEventListener('click', closeModalHandler);
    
    // Evitar que el modal se cierre al hacer clic dentro del contenido
    const modalContainer = pautaModal.querySelector('.modal-container');
    if(modalContainer) {
        modalContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    pautaModal.addEventListener('click', closeModalHandler);
    
    // Manejar envío del formulario
    if(pautaForm) {
        pautaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para guardar la pauta
            alert('Pauta guardada con éxito!');
            closeModalHandler();
        });
    }

    // 2. Función para cargar modelos en el select del modal
    async function cargarModelos() {
        const selectModelo = document.getElementById('modeloPauta');
        if(!selectModelo) return;
        
        try {
            // Mostrar estado de carga
            selectModelo.innerHTML = '<option value="">Cargando modelos...</option>';
            
            const response = await fetch('http://10.100.39.23:8000/modelos/api/head/');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const modelos = await response.json();
            
            // Limpiar y agregar opción por defecto
            selectModelo.innerHTML = '<option value="">Seleccionar modelo</option>';
            
            // Agregar cada modelo como opción
            modelos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo.id;
                option.textContent = `${modelo.nombres} ${modelo.apellidos}`;
                selectModelo.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error al cargar modelos:', error);
            selectModelo.innerHTML = '<option value="">Error al cargar modelos</option>';
            
            // Reintentar después de 5 segundos
            setTimeout(cargarModelos, 5000);
        }
    }

    // 3. Función para actualizar las tarjetas de resumen
    async function actualizarTarjetas() {
        // Mostrar estado de carga
        document.querySelectorAll('.card-value').forEach(el => {
            el.textContent = 'Cargando...';
            el.className = 'card-value loading';
        });
        
        document.querySelectorAll('.card-trend').forEach(el => {
            el.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizando...';
            el.className = 'card-trend trend-neutral';
        });

        try {
            const response = await fetch('http://10.100.39.23:8000/pautas/apipautas/general/');
            
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            
            // Actualizar con datos reales
            const pendientesElement = document.querySelector('#PautasPendientes .card-value');
            const activasElement = document.querySelector('#PautasActivas .card-value');
            const inversionElement = document.querySelector('#InversionTotal .card-value');
            
            if(pendientesElement) {
                pendientesElement.textContent = data.pendientes;
                pendientesElement.className = 'card-value';
            }
            
            if(activasElement) {
                activasElement.textContent = data.activas;
                activasElement.className = 'card-value';
            }
            
            if(inversionElement) {
                inversionElement.textContent = `$${data.inversion_Total.toLocaleString()}`;
                inversionElement.className = 'card-value';
            }
            
            // Actualizar tendencias
            document.querySelectorAll('.card-trend').forEach(el => {
                el.className = 'card-trend trend-neutral';
                el.innerHTML = '<i class="fas fa-equals"></i> Actualizado';
            });
            
        } catch (error) {
            console.error('Error al obtener datos:', error);
            
            document.querySelectorAll('.card-value').forEach(el => {
                el.textContent = 'Error';
                el.className = 'card-value error';
            });
            
            document.querySelectorAll('.card-trend').forEach(el => {
                el.className = 'card-trend trend-error';
                el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al cargar';
            });
            
            // Reintentar después de 10 segundos
            setTimeout(actualizarTarjetas, 10000);
        }
    }

    // 4. Función para cargar la tabla de pautas
    async function cargarTablaPautas() {
        const tbody = document.querySelector('.pautas-table tbody');
        if(!tbody) return;
        
        try {
            // Mostrar estado de carga
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i> Cargando datos de pautas...
                    </td>
                </tr>
            `;
            
            const response = await fetch('http://10.100.39.23:8000/pautas/apipautas/general/');
            if (!response.ok) throw new Error('Error al cargar los datos');
            
            const data = await response.json();
            
            // Si no hay pautas, mostrar mensaje
            if (!data.lista_pautas || data.lista_pautas.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-data-message">
                            No se encontraron pautas registradas
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Limpiar tabla
            tbody.innerHTML = '';
            
            // Procesar cada pauta
            data.lista_pautas.forEach(pauta => {
                const row = document.createElement('tr');
                
                // Determinar clases de estado según status_pauta
                let statusClass = '';
                let statusText = '';
                
                switch(pauta.status_pauta.toLowerCase()) {
                    case 'pendiente':
                        statusClass = 'pauta-status--on-hold';
                        statusText = 'Pendiente';
                        break;
                    case 'procesada':
                        statusClass = 'pauta-status--active';
                        statusText = 'Activa';
                        break;
                    default:
                        statusClass = 'pauta-status--in-progress';
                        statusText = 'En Proceso';
                }
                
                // Determinar autorizaciones
                const authComercialClass = pauta.autorizacio_comercial === 'ny' 
                    ? 'auth-badge--approved' 
                    : 'auth-badge--rejected';
                
                const authDirectivaClass = pauta.autorizacion_directiva === 'ss' 
                    ? 'auth-badge--approved' 
                    : pauta.autorizacion_directiva ? 'auth-badge--pending' : 'auth-badge--rejected';
                
                // Formatear fecha
                const fechaParts = pauta.fecha.split('-');
                const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
                
                // Crear fila de la tabla
                row.innerHTML = `
                    <td class="fecha-cell">${fechaFormateada}</td>
                    <td class="nombre-pauta-cell">${pauta.nombre_pauta}</td>
                    <td class="ubicacion-cell">${pauta.ubicacion_pauta}</td>
                    <td class="modelo-cell">
                        <div class="modelo-info">
                            <img src="" alt="${pauta.modelo}" class="modelo-avatar">
                            <div class="modelo-details">
                                <span class="modelo-name">${pauta.modelo}</span>
                            </div>
                        </div>
                    </td>
                    <td class="autorizaciones-cell">
                        <div class="auth-badges">
                            <span class="auth-badge ${authComercialClass}" title="Autorización Comercial">
                                <i class="fas ${pauta.autorizacio_comercial === 'ny' ? 'fa-check-circle' : 'fa-times-circle'}"></i> Comercial
                            </span>
                            <span class="auth-badge ${authDirectivaClass}" title="Autorización Directiva">
                                <i class="fas ${pauta.autorizacion_directiva === 'ss' ? 'fa-check-circle' : pauta.autorizacion_directiva ? 'fa-clock' : 'fa-times-circle'}"></i> Directiva
                            </span>
                        </div>
                    </td>
                    <td class="monto-cell">$${pauta.monto_de_pauta.toLocaleString()}</td>
                    <td class="estado-cell">
                        <span class="pauta-status ${statusClass}">
                            <span class="pauta-status__circle"></span>
                            <span class="pauta-status__text">${statusText}</span>
                        </span>
                    </td>
                    <td class="action-cell">
                        <div class="action-buttons">
                            <button class="btn-action edit" title="Editar pauta">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action view" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action delete" title="Eliminar pauta">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error al cargar la tabla de pautas:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="error-message">
                        <i class="fas fa-exclamation-triangle"></i> Error al cargar los datos. Intente nuevamente.
                    </td>
                </tr>
            `;
            
            // Reintentar después de 5 segundos
            setTimeout(cargarTablaPautas, 5000);
        }
    }

    // 5. Inicializar todo cuando la página cargue
    actualizarTarjetas();
    cargarTablaPautas();

    // 6. Configurar actualización periódica cada 5 minutos (300,000 ms)
    setInterval(actualizarTarjetas, 300000);
    setInterval(cargarTablaPautas, 300000);
});