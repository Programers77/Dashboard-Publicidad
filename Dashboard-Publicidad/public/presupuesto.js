document.getElementById('guardarPresupuesto').addEventListener('click', function() {
    const form = document.getElementById('formPresupuesto');
    const monto = document.getElementById('montoPresupuesto');
    const fecha = document.getElementById('fechaRegistro');
    const observaciones = document.getElementById('observaciones');
    const guardarBtn = this;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    // Crear objeto con los datos del nuevo presupuesto
    const nuevoPresupuesto = {
        monto: parseFloat(monto.value),
        fecha: fecha.value,
        observaciones: observaciones.value,
        timestamp: new Date().getTime() // Agregamos timestamp para identificar único
    };

    // Verificar si ya existe un presupuesto similar (opcional)
    const existeSimilar = presupuestos.some(p =>
        p.monto === nuevoPresupuesto.monto &&
        p.fecha === nuevoPresupuesto.fecha
    );

    if (existeSimilar) {
        // Mostrar advertencia pero permitir continuar
        Swal.fire({
            title: 'Advertencia',
            text: 'Ya existe un presupuesto con el mismo monto y fecha. ¿Deseas registrar este presupuesto de todas formas?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                guardarPresupuesto(nuevoPresupuesto);
            }
        });
    } else {
        guardarPresupuesto(nuevoPresupuesto);
    }
});

// Función para guardar el presupuesto y mostrar confirmación
function guardarPresupuesto(presupuesto) {
    // Agregar al array
    presupuestos.unshift(presupuesto);
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));

    // Mostrar SweetAlert de éxito
    Swal.fire({
        title: '¡Registro exitoso!',
        html: `Monto: $${presupuesto.monto.toFixed(2)}<br>Fecha: ${presupuesto.fecha}`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    // Resetear el formulario
    document.getElementById('formPresupuesto').reset();
    document.getElementById('formPresupuesto').classList.remove('was-validated');

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('presupuestoModal'));
    if (modal) modal.hide();

    // Actualizar el historial
    actualizarHistorial();
}

// Configura los eventos para eliminar presupuestos
function setupEliminarPresupuestos() {
    document.querySelectorAll('.eliminar-presupuesto').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            eliminarPresupuesto(id);
        });
    });
}

// Elimina un presupuesto por su ID
function eliminarPresupuesto(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas eliminar este presupuesto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            presupuestos = presupuestos.filter(p => p.id !== id);
            localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
            actualizarHistorial();
            Swal.fire('Eliminado', 'El presupuesto ha sido eliminado correctamente', 'success');
        }
    });
}

// Array para almacenar los presupuestos
let presupuestos = JSON.parse(localStorage.getItem('presupuestos')) || [];

// Función para inicializar la aplicación
function initApp() {
    // Cargar presupuestos al iniciar
    actualizarHistorial();
    
    // Configurar el evento del botón guardar (solo una vez)
    setupGuardarPresupuesto();
    
    // Configurar evento para eliminar presupuestos
    setupEliminarPresupuestos();
}

// Configura el evento para guardar presupuesto (evita duplicación)
function setupGuardarPresupuesto() {
    const guardarBtn = document.getElementById('guardarPresupuesto');
    
    // Eliminar cualquier listener previo
    guardarBtn.replaceWith(guardarBtn.cloneNode(true));
    const nuevoGuardarBtn = document.getElementById('guardarPresupuesto');
    
    nuevoGuardarBtn.addEventListener('click', function() {
        const form = document.getElementById('formPresupuesto');
        const monto = document.getElementById('montoPresupuesto');
        const fecha = document.getElementById('fechaRegistro');
        const observaciones = document.getElementById('observaciones');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Deshabilitar el botón para evitar múltiples clics
        this.disabled = true;
        
        // Crear nuevo presupuesto
        const nuevoPresupuesto = {
            monto: parseFloat(monto.value),
            fecha: fecha.value,
            observaciones: observaciones.value,
            id: Date.now() // ID único para cada presupuesto
        };
        
        // Verificar duplicados (opcional)
        if (!verificarDuplicado(nuevoPresupuesto)) {
            // Agregar al array
            presupuestos.unshift(nuevoPresupuesto);
            localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
            
            // Animación de éxito
            this.innerHTML = '<i class="fas fa-check-circle me-2"></i> Guardando...';
            this.classList.add('animate__animated', 'animate__pulse');
            
            setTimeout(() => {
                resetearFormulario(form, this);
                actualizarHistorial();
                mostrarNotificacion('Presupuesto registrado exitosamente!', 'success');
            }, 1000);
        } else {
            this.disabled = false;
            mostrarNotificacion('Este presupuesto ya existe', 'warning');
        }
    });
}

// Verifica si ya existe un presupuesto similar
function verificarDuplicado(nuevoPresupuesto) {
    return presupuestos.some(p => 
        p.monto === nuevoPresupuesto.monto &&
        p.fecha === nuevoPresupuesto.fecha &&
        p.observaciones === nuevoPresupuesto.observaciones
    );
}

// Resetea el formulario después de guardar
function resetearFormulario(form, guardarBtn) {
    form.reset();
    form.classList.remove('was-validated');
    
    // Restaurar el botón
    guardarBtn.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Presupuesto';
    guardarBtn.classList.remove('animate__animated', 'animate__pulse');
    guardarBtn.disabled = false;
    
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('presupuestoModal'));
    if (modal) modal.hide();
}

// Actualiza la tabla de historial
function actualizarHistorial() {
    const cuerpoHistorial = document.getElementById('cuerpoHistorial');
    cuerpoHistorial.innerHTML = '';
    
    if (presupuestos.length === 0) {
        cuerpoHistorial.innerHTML = `
            <tr class="placeholder-row">
                <td colspan="4" class="text-center py-4">
                    <i class="fas fa-folder-open fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No hay presupuestos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    presupuestos.forEach((presupuesto) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${formatearFecha(presupuesto.fecha)}</td>
            <td>$${presupuesto.monto.toFixed(2)}</td>
            <td>${presupuesto.observaciones || 'Sin observaciones'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger eliminar-presupuesto" data-id="${presupuesto.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        cuerpoHistorial.appendChild(fila);
    });
    
    // Volver a configurar los eventos de eliminar
    setupEliminarPresupuestos();
}

// Configura los eventos para eliminar presupuestos
function setupEliminarPresupuestos() {
    document.querySelectorAll('.eliminar-presupuesto').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            eliminarPresupuesto(id);
        });
    });
}

// Elimina un presupuesto por su ID
function eliminarPresupuesto(id) {
    if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
        presupuestos = presupuestos.filter(p => p.id !== id);
        localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
        actualizarHistorial();
        alert('Presupuesto eliminado correctamente');
    }
}

// Formatea la fecha para mostrarla
function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

// Muestra notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);