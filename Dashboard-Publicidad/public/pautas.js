document.addEventListener('DOMContentLoaded', function() {
    // 1. Variables globales y referencias a elementos del DOM
    const pautaModal = document.getElementById('pautaModal');
    const editPautaModal = document.getElementById('pauta-modal-edicion');
    const API_BASE_URL = 'http://10.100.39.23:8000';
    
    // 2. Funciones de inicialización
    function init() {
        setupModalEvents();
        actualizarTarjetas();
        cargarTablaPautas();
        cargarModelos();
        
        // Actualizaciones periódicas
        setInterval(actualizarTarjetas, 300000); // 5 minutos
        setInterval(cargarTablaPautas, 300000); // 5 minutos
    }

    // 3. Funciones para manejar datos
    // 3.1. Funciones para cargar datos
    async function cargarModelos() {
        const selectModelo = document.getElementById('modeloPauta');
        if(!selectModelo) return;
        
        try {
            selectModelo.innerHTML = '<option value="">Cargando modelos...</option>';
            const response = await fetch(`${API_BASE_URL}/modelos/api/head/`);
            
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
            const response = await fetch(`${API_BASE_URL}/pautas/apipautas/general/`);
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
            
            const response = await fetch(`${API_BASE_URL}/pautas/apipautas/general/`);
            if (!response.ok) throw new Error('Error al cargar los datos');
            
            const data = await response.json();
            pautasDataGlobal = data; // Almacenar datos globalmente
            
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
                let statusText = pauta.status_pauta || 'Pendiente';
                
                switch(pauta.status_pauta.toLowerCase()) {
                    case 'activa':
                        statusClass = 'pauta-status--active';
                        statusText = 'Activa';
                        break;
                    case 'cancelada':
                        statusClass = 'pauta-status--canceled';
                        statusText = 'Cancelada';
                        break;
                    default:
                        statusClass = 'pauta-status--on-hold';
                        statusText = 'Pendiente';
                }

                const authComercialText = pauta.autorizacio_comercial === true || pauta.autorizacio_comercial === 'true' 
                    ? 'Aprobada' 
                    : 'Rechazada';
                    
                const authDirectivaText = pauta.autorizacion_directiva === true || pauta.autorizacion_directiva === 'true' 
                    ? 'Aprobada' 
                    : 'Rechazada';
                    
                const authComercialClass = authComercialText === 'Aprobada' 
                    ? 'auth-badge--approved' 
                    : 'auth-badge--rejected';
                    
                const authDirectivaClass = authDirectivaText === 'Aprobada' 
                    ? 'auth-badge--approved' 
                    : 'auth-badge--rejected';
                
                let fechaFormateada = 'Fecha no válida';
                try {
                    const fechaParts = pauta.fecha.split('-');
                    if (fechaParts.length === 3) {
                        fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;
                    }
                } catch (e) {
                    console.error('Error formateando fecha:', e);
                }
                
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
                    <td class="monto-cell">$${pauta.monto_de_pauta ? pauta.monto_de_pauta.toLocaleString() : '0'}</td>
                    <td class="estado-cell">
                        <span class="pauta-status ${statusClass}">
                            <span class="pauta-status__circle"></span>
                            <span class="pauta-status__text">${statusText}</span>
                        </span>
                    </td>
                    <td class="action-cell">
                        <div class="action-buttons">
                            <button class="btn-action edit" title="Editar pauta" data-pauta-id="${pauta.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" title="Eliminar pauta" data-pauta-id="${pauta.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                // Configurar botones de acción con id_pauta
                row.querySelector('.edit').setAttribute('data-pauta-id', pauta.id_pauta);
                row.querySelector('.delete').setAttribute('data-pauta-id', pauta.id_pauta);
                
                tbody.appendChild(row);
            });

            // Configurar event delegation para los botones
            document.querySelector('.pautas-table').addEventListener('click', function(e) {
                if (e.target.closest('.edit')) {
                    const button = e.target.closest('.edit');
                    const pautaId = button.getAttribute('data-pauta-id');
                    abrirModalEdicion(pautaId);
                }
                
                if (e.target.closest('.delete')) {
                    const button = e.target.closest('.delete');
                    const pautaId = button.getAttribute('data-pauta-id');
                    confirmarEliminacion(pautaId);
                }
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

    // Modificar la función abrirModalEdicion para usar datos locales
    async function abrirModalEdicion(pautaId) {
        const modal = document.getElementById('pauta-modal-edicion');
        const spinner = document.getElementById('pauta-spinner');
        const form = document.getElementById('pauta-form-editar');
        const errorMsg = document.getElementById('pauta-error-msg');

        try {
            // Limpiar y preparar el modal
            limpiarModalPauta();
            modal.style.display = 'block';
            spinner.style.display = 'block';
            form.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Validar que existan los datos globales
            if (!pautasDataGlobal || !pautasDataGlobal.lista_pautas) {
                throw new Error('Datos de pautas no disponibles');
            }

            // Buscar la pauta específica
            const pauta = pautasDataGlobal.lista_pautas.find(p => p.id_pauta == pautaId);
            
            if (!pauta) {
                throw new Error(`No se encontró la pauta con ID: ${pautaId}`);
            }

            // Mostrar el nombre del modelo como título
            const modeloTitle = document.getElementById('pauta-modelo-titulo');
            if (modeloTitle) {
                modeloTitle.textContent = pauta.modelo || 'Modelo no especificado';
            }

            // Función auxiliar para establecer valores de forma segura
            const setValue = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value !== undefined && value !== null ? value : '';
                }
            };

            // Llenar los campos del formulario
            setValue('pauta-editar-fecha', pauta.fecha);
            setValue('pauta-editar-nombre', pauta.nombre_pauta);
            setValue('pauta-editar-ubicacion', pauta.ubicacion_pauta);
            setValue('pauta-editar-monto', pauta.monto_de_pauta);
            setValue('pauta-editar-estado', pauta.status_pauta?.toUpperCase());

            // Configurar los radio buttons
            const setRadioValue = (name, value) => {
                const radio = document.querySelector(`input[name="${name}"][value="${String(value)}"]`);
                if (radio) {
                    radio.checked = true;
                }
            };

            setRadioValue('pauta-auth-comercial', pauta.autorizacio_comercial);
            setRadioValue('pauta-auth-directiva', pauta.autorizacion_directiva);

            // Gestionar campos ocultos (IDs)
            const manageHiddenField = (id, name, value) => {
                let field = document.getElementById(id);
                if (!field) {
                    field = document.createElement('input');
                    field.type = 'hidden';
                    field.id = id;
                    field.name = name;
                    form.appendChild(field);
                }
                field.value = value;
            };

            manageHiddenField('pauta-editar-pauta-id', 'pauta_id', pauta.id_pauta);
            manageHiddenField('pauta-editar-modelo-id', 'id_modelo', pauta.id_modelo);


            // Finalizar carga
            spinner.style.display = 'none';
            form.style.display = 'block';
            form.dataset.modeloId = pauta.id_modelo;

        } catch (error) {
            console.error('Error en abrirModalEdicion:', error);
            
            // Mostrar error al usuario
            spinner.style.display = 'none';
            form.style.display = 'block';
            
            if (errorMsg) {
                errorMsg.textContent = `Error al cargar los datos: ${error.message}`;
                errorMsg.style.display = 'block';
            } else {
                alert(`Error: ${error.message}`);
            }
        }
    }

// Función para limpiar el modal (mejorada)
function limpiarModalPauta() {
    // Limpiar campos del formulario
    const fieldsToClear = [
        'pauta-modelo-titulo', // Título del modelo
        'pauta-editar-fecha',
        'pauta-editar-nombre',
        'pauta-editar-ubicacion',
        'pauta-editar-monto',
        'pauta-editar-estado',
        'pauta-editar-pauta-id',
        'pauta-editar-modelo-id'
    ];

    fieldsToClear.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                element.value = '';
            } else if (element.tagName === 'H3') {
                element.textContent = '';
            }
        }
    });

    // Limpiar radio buttons
    ['pauta-auth-comercial', 'pauta-auth-directiva'].forEach(name => {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => radio.checked = false);
    });

    // Limpiar mensajes de error
    const errorMsg = document.getElementById('pauta-error-msg');
    if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    }
}

    function confirmarEliminacion(pautaId) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Mostrar loader
                    const deleteBtn = document.querySelector(`.delete[data-pauta-id="${pautaId}"]`);
                    if (deleteBtn) {
                        const originalHtml = deleteBtn.innerHTML;
                        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        deleteBtn.disabled = true;

                        const response = await fetch(`${API_BASE_URL}/pautas/apipautas/${pautaId}/`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Error al eliminar la pauta');
                        }

                        // Mostrar mensaje de éxito
                        await Swal.fire({
                            icon: 'success',
                            title: '¡Eliminada!',
                            text: 'La pauta ha sido eliminada correctamente.',
                            confirmButtonText: 'Aceptar'
                        });

                        // Actualizar la tabla
                        cargarTablaPautas();
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    
                    // Restaurar botón
                    const deleteBtn = document.querySelector(`.delete[data-pauta-id="${pautaId}"]`);
                    if (deleteBtn) {
                        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                        deleteBtn.disabled = false;
                    }
                    
                    // Mostrar error
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Ocurrió un error al eliminar la pauta',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        });
    }

    // 4. Funciones para manejo de formularios
    function limpiarModalPauta() {
        // Solo limpia elementos que sabemos que existen
        const elementsToClear = [
            'pauta-editar-fecha',
            'pauta-editar-nombre',
            'pauta-editar-ubicacion',
            'pauta-editar-monto',
            'pauta-editar-estado'
        ];
        
        elementsToClear.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });

        // Limpiar radio buttons si existen
        ['pauta-auth-comercial', 'pauta-auth-directiva'].forEach(name => {
            const radios = document.querySelectorAll(`input[name="${name}"]`);
            if (radios.length > 0) {
                radios.forEach(radio => radio.checked = false);
            }
        });
    }

    // Agregar evento de click al botón de guardar cambios
        document.querySelector('.pauta-btn-guardar').addEventListener('click', async function(event) {
            event.preventDefault();

            // Guardar referencia al botón y su estado original
            const btnGuardar = this;
            const originalBtnText = btnGuardar.innerHTML;
            
            try {
                // Mostrar loader en el botón
                btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                btnGuardar.disabled = true;

                // Obtener los valores del formulario
                const fecha = document.getElementById('pauta-editar-fecha').value;
                const nombrePauta = document.getElementById('pauta-editar-nombre').value;
                const ubicacionPauta = document.getElementById('pauta-editar-ubicacion').value;
                const montoDePauta = parseFloat(document.getElementById('pauta-editar-monto').value);
                const autorizacionComercial = document.querySelector('input[name="pauta-auth-comercial"]:checked').value === 'true';
                const autorizacionDirectiva = document.querySelector('input[name="pauta-auth-directiva"]:checked').value === 'true';
                const statusPauta = document.getElementById('pauta-editar-estado').value;
                const modelo = parseInt(document.getElementById('pauta-editar-modelo-id').value);

                // Validación básica
                if (!fecha || !nombrePauta || isNaN(modelo)) {
                    throw new Error('Por favor complete todos los campos requeridos');
                }

                // Crear el objeto de datos
                const datos = {
                    fecha,
                    nombre_pauta: nombrePauta,
                    ubicacion_pauta: ubicacionPauta,
                    autorizacio_comercial: autorizacionComercial,
                    autorizacion_directiva: autorizacionDirectiva,
                    monto_de_pauta: montoDePauta,
                    status_pauta: statusPauta,
                    modelo
                };

                // Obtener la pauta ID del campo oculto
                const pautaId = document.getElementById('pauta-editar-pauta-id').value;

                const respuesta = await fetch(`http://10.100.39.23:8000/pautas/apipautas/${pautaId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const errorData = await respuesta.json();
                    throw new Error(errorData.message || 'Error al editar la pauta');
                }

                // Éxito - mostrar alerta y cerrar modal
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'La pauta se ha actualizado correctamente',
                    confirmButtonText: 'Aceptar'
                });

                // Cerrar el modal y limpiar
                const editPautaModal = document.getElementById('pauta-modal-edicion');
                editPautaModal.style.display = 'none';
                limpiarModalPauta();
                
                // Actualizar la tabla
                cargarTablaPautas();

            } catch (error) {
                console.error('Error al enviar la petición:', error);
                
                // Mostrar SweetAlert de error
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Ocurrió un error al actualizar la pauta',
                    confirmButtonText: 'Aceptar'
                });

            } finally {
                // Siempre restablecer el botón, independientemente del resultado
                btnGuardar.innerHTML = originalBtnText;
                btnGuardar.disabled = false;
            }
        });

        // Asegurarnos que el botón se restablezca si el modal se cierra manualmente
        document.querySelector('.pauta-close-modal, .pauta-btn-cancelar').addEventListener('click', function() {
            const btnGuardar = document.querySelector('.pauta-btn-guardar');
            if (btnGuardar) {
                btnGuardar.innerHTML = 'Guardar Cambios';
                btnGuardar.disabled = false;
            }
        });

        // También para cuando se hace clic fuera del modal
        document.getElementById('pauta-modal-edicion').addEventListener('click', function(event) {
            if (event.target === this) {
                const btnGuardar = document.querySelector('.pauta-btn-guardar');
                if (btnGuardar) {
                    btnGuardar.innerHTML = 'Guardar Cambios';
                    btnGuardar.disabled = false;
                }
            }
    });

    // 4.2. Manejo del formulario de creación
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const btnSave = form.querySelector('.btn-save');
        const originalBtnText = btnSave.innerHTML;
        
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
        return await fetch(`${API_BASE_URL}/pautas/apipautas/`, {
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

    // 5. Funciones para manejo de modales
    function setupModalEvents() {
        const btnAddPauta = document.getElementById('btnAddPauta');
        const closeModal = document.getElementById('closeModal');
        const cancelPauta = document.getElementById('cancelPauta');
        const pautaForm = document.getElementById('pautaForm');
        const btnSave = document.querySelector('.btn-save');

        // Abrir modal para nueva pauta
        if(btnAddPauta) {
            btnAddPauta.addEventListener('click', function() {
                pautaModal.classList.add('active');
                pautaModal.querySelector('.modal-container').classList.add('animate__animated', 'animate__fadeIn');
                cargarModelos();
            });
        }

        // Cerrar modales
        const closeModalElements = [closeModal, cancelPauta];
        closeModalElements.forEach(element => {
            if(element) element.addEventListener('click', closeModalHandler);
        });

        // Cerrar haciendo clic fuera del modal
        if(pautaModal) {
            const modalContainer = pautaModal.querySelector('.modal-container');
            if(modalContainer) {
                modalContainer.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
            
            pautaModal.addEventListener('click', closeModalHandler);
        }

        // Manejar envío del formulario
        if(pautaForm && btnSave) {
            pautaForm.addEventListener('submit', handleFormSubmit);
        }

        // Eventos para el modal de edición
        document.querySelector('.pauta-close-modal').addEventListener('click', () => {
            editPautaModal.style.display = 'none';
            limpiarModalPauta();
        });

        document.querySelector('.pauta-btn-cancelar').addEventListener('click', () => {
            editPautaModal.style.display = 'none';
            limpiarModalPauta();
        });

        window.addEventListener('click', (event) => {
            if (event.target === editPautaModal) {
                editPautaModal.style.display = 'none';
                limpiarModalPauta();
            }
        });
    }

    function closeModalHandler() {
        const modal = document.getElementById('pautaModal');
        modal.classList.remove('active');
        modal.querySelector('.modal-container').classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            modal.querySelector('.modal-container').classList.remove('animate__animated', 'animate__fadeOut');
        }, 300);
    }

    // 6. Inicialización de la aplicación
    init();
});