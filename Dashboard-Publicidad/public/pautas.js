document.addEventListener('DOMContentLoaded', function() {
    // 1. Declaración de todas las funciones
    
    // Función para cargar modelos en el select del modal
    async function cargarModelos() {
        const selectModelo = document.getElementById('modeloPauta');
        if(!selectModelo) return;
        
        try {
            selectModelo.innerHTML = '<option value="">Cargando modelos...</option>';
            const response = await fetch('http://10.100.39.23:8000/modelos/api/head/');
            
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const modelos = await response.json();
            selectModelo.innerHTML = '<option value="">Seleccionar modelo</option>';
            
            modelos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo.id;
                option.textContent = `${modelo.nombres} ${modelo.apellidos}`;
                selectModelo.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error al cargar modelos:', error);
            selectModelo.innerHTML = '<option value="">Error al cargar modelos</option>';
            setTimeout(cargarModelos, 5000);
        }
    }

    // Función para actualizar las tarjetas de resumen
    async function actualizarTarjetas() {
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
            
            setTimeout(actualizarTarjetas, 10000);
        }
    }

    // Función para cargar la tabla de pautas
        async function cargarTablaPautas() {
        const tbody = document.querySelector('.pautas-table tbody');
        if(!tbody) return;
        
        try {
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
            
            tbody.innerHTML = '';
            
            data.lista_pautas.forEach(pauta => {
                const row = document.createElement('tr');
                
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

                // Convertir valores booleanos a texto
                const authComercialText = pauta.autorizacio_comercial === true || pauta.autorizacio_comercial === 'true' 
                    ? 'Aprobada' 
                    : 'Rechazada';
                    
                const authDirectivaText = pauta.autorizacion_directiva === true || pauta.autorizacion_directiva === 'true' 
                    ? 'Aprobada' 
                    : 'Rechazada';
                    
                // Clases CSS según aprobación
                const authComercialClass = authComercialText === 'Aprobada' 
                    ? 'auth-badge--approved' 
                    : 'auth-badge--rejected';
                    
                const authDirectivaClass = authDirectivaText === 'Aprobada' 
                    ? 'auth-badge--approved' 
                    : 'auth-badge--rejected';
                
                const fechaParts = pauta.fecha.split('-');
                const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
                
                row.innerHTML = `
                    <td class="fecha-cell">${fechaFormateada}</td>
                    <td class="nombre-pauta-cell">${pauta.nombre_pauta}</td>
                    <td class="ubicacion-cell">${pauta.ubicacion_pauta}</td>
                    <td class="modelo-cell">
                        <div class="modelo-info">
                            <div class="modelo-details">
                                <span class="modelo-name">${pauta.modelo}</span>
                            </div>
                        </div>
                    </td>
                    <td class="autorizaciones-cell">
                        <div class="auth-badges">
                            <span class="auth-badge ${authComercialClass}" title="Autorización Comercial">
                                <i class="fas ${authComercialText === 'Aprobada' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                ${authComercialText}
                            </span>
                            <span class="auth-badge ${authDirectivaClass}" title="Autorización Directiva">
                                <i class="fas ${authDirectivaText === 'Aprobada' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                ${authDirectivaText}
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
            setTimeout(cargarTablaPautas, 5000);
        }
    }

    // Función para cerrar el modal (mejorada con animación)
    function closeModalHandler() {
        const modal = document.getElementById('pautaModal');
        modal.classList.remove('active');
        // Opcional: agregar animación de salida
        modal.querySelector('.modal-container').classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            modal.querySelector('.modal-container').classList.remove('animate__animated', 'animate__fadeOut');
        }, 300);
    }

    // Configuración de eventos del modal
    function setupModalEvents() {
        const btnAddPauta = document.getElementById('btnAddPauta');
        const pautaModal = document.getElementById('pautaModal');
        const closeModal = document.getElementById('closeModal');
        const cancelPauta = document.getElementById('cancelPauta');
        const pautaForm = document.getElementById('pautaForm');
        const btnSave = document.querySelector('.btn-save');

        // Abrir modal con animación
        if(btnAddPauta) {
            btnAddPauta.addEventListener('click', function() {
                pautaModal.classList.add('active');
                pautaModal.querySelector('.modal-container').classList.add('animate__animated', 'animate__fadeIn');
                cargarModelos();
            });
        }

        // Cerrar modal
        const closeModalElements = [closeModal, cancelPauta];
        closeModalElements.forEach(element => {
            if(element) element.addEventListener('click', closeModalHandler);
        });

        // Manejar clics en el modal
        if(pautaModal) {
            // Evitar cierre al hacer clic dentro del contenido
            const modalContainer = pautaModal.querySelector('.modal-container');
            if(modalContainer) {
                modalContainer.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
            
            // Cerrar al hacer clic fuera del contenido
            pautaModal.addEventListener('click', closeModalHandler);
        }

        // Manejar envío del formulario (función mejorada)
        if(pautaForm && btnSave) {
            pautaForm.addEventListener('submit', handleFormSubmit);
        }
    }

    // Función separada para manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const btnSave = form.querySelector('.btn-save');
        const originalBtnText = btnSave.innerHTML;
        
        // Mostrar estado de carga
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btnSave.disabled = true;

        try {
            const formData = getFormData();
            validateFormData(formData);

            const response = await submitPauta(formData);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la pauta');
            }

            showSuccess();
            resetForm(form);
            
        } catch (error) {
            handleFormError(error);
        } finally {
            resetSubmitButton(btnSave, originalBtnText);
        }
    }

    // Helper functions
    function getFormData() {
        return {
            fecha: document.getElementById('fechaPauta').value,
            nombre_pauta: document.getElementById('nombrePauta').value,
            ubicacion_pauta: document.getElementById('ubicacionPauta').value,
            autorizacio_comercial: document.getElementById('autorizacionComercial').value,
            autorizacion_directiva: document.getElementById('autorizacionDirectiva').value,
            monto_de_pauta: parseFloat(document.getElementById('montoPauta').value),
            status_pauta: document.getElementById('estadoPauta').value,
            modelo: parseInt(document.getElementById('modeloPauta').value)
        };
    }

    function validateFormData(formData) {
        if (!formData.fecha || !formData.nombre_pauta || isNaN(formData.modelo)) {
            throw new Error('Por favor complete todos los campos requeridos');
        }
    }

    async function submitPauta(formData) {
        return await fetch('http://10.100.39.23:8000/pautas/apipautas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
    }

    function showSuccess() {
        alert('Pauta creada exitosamente!');
        closeModalHandler();
        cargarTablaPautas();
    }

    function resetForm(form) {
        form.reset();
    }

    function handleFormError(error) {
        console.error('Error:', error);
        alert(error.message);
    }

    function resetSubmitButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }

    // Inicialización (debes llamar esta función en tu DOMContentLoaded)
    function initPautaModal() {
        setupModalEvents();
    }


    initPautaModal();

    // 3. Inicialización
    actualizarTarjetas();
    cargarTablaPautas();
    setInterval(actualizarTarjetas, 300000); // Actualizar cada 5 minutos
    setInterval(cargarTablaPautas, 300000); // Actualizar cada 5 minutos
});