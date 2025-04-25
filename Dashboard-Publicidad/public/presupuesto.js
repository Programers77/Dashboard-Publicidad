<<<<<<< HEAD
// Función de verificación robusta de SweetAlert2
function isSweetAlertLoaded() {
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 no está disponible. Intentando cargar...');
        loadSweetAlertFallback();
        return false;
    }
    return true;
}

// Carga alternativa si falla la CDN principal
function loadSweetAlertFallback() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/sweetalert2@11';
        script.onload = () => {
            console.log('SweetAlert2 cargado desde fallback');
            resolve();
        };
        script.onerror = () => {
            console.error('Falló la carga de SweetAlert2');
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Función para calcular totales
function calcularTotales() {
    const presupuestoTotalInput = document.getElementById('presupuestoTotal');
    const categoriaInputs = document.querySelectorAll('.categoria-input');
    const totalAsignadoSpan = document.getElementById('totalAsignado');
    const restanteSpan = document.getElementById('restante');

    let totalAsignado = 0;

    categoriaInputs.forEach(input => {
        totalAsignado += parseFloat(input.value) || 0;
    });

    const presupuestoTotal = parseFloat(presupuestoTotalInput.value) || 0;
    const restante = presupuestoTotal - totalAsignado;

    // Actualizar UI
    totalAsignadoSpan.textContent = `$${totalAsignado.toFixed(2)}`;
    restanteSpan.textContent = `$${restante.toFixed(2)}`;

    // Calcular porcentajes
    categoriaInputs.forEach(input => {
        const valor = parseFloat(input.value) || 0;
        const porcentaje = presupuestoTotal > 0 ? (valor / presupuestoTotal * 100) : 0;
        const porcentajeSpan = document.getElementById(`porcentaje${input.id.charAt(0).toUpperCase() + input.id.slice(1)}`);
        if (porcentajeSpan) {
            porcentajeSpan.textContent = `${porcentaje.toFixed(1)}%`;
        }
    });

    return { totalAsignado, presupuestoTotal, restante };
}

// Función principal para manejar el presupuesto
async function handlePresupuesto() {
    // Verificar SweetAlert2
    if (!isSweetAlertLoaded()) {
        await loadSweetAlertFallback();
    }

    // Verificación final
    if (typeof Swal === 'undefined') {
        alert('Error: El sistema de notificaciones no está disponible. Recargue la página.');
        return;
    }

    const { totalAsignado, presupuestoTotal, restante } = calcularTotales();
    const fechaAsignacion = document.getElementById('fechaAsignacion').value;
    const responsable = document.getElementById('responsable').value.trim();
    const presupuestoForm = document.getElementById('presupuestoForm');
    const modal = bootstrap.Modal.getInstance(document.getElementById('asignarPresupuestoModal'));

    // Validaciones
    if (!presupuestoTotal || presupuestoTotal <= 0) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe ingresar un presupuesto total válido',
            confirmButtonColor: '#4361ee'
        });
        return;
    }

    if (!fechaAsignacion) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe seleccionar una fecha de asignación',
            confirmButtonColor: '#4361ee'
        });
        return;
    }

    if (totalAsignado > presupuestoTotal) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El total asignado a categorías no puede ser mayor al presupuesto total',
            confirmButtonColor: '#4361ee'
        });
        return;
    }

    // Confirmación con SweetAlert
    const result = await Swal.fire({
        title: '¿Confirmar asignación?',
        html: `
            <div class="text-start">
                <p><strong>Presupuesto Total:</strong> $${presupuestoTotal.toFixed(2)}</p>
                <p><strong>Total Asignado:</strong> $${totalAsignado.toFixed(2)}</p>
                <p><strong>Restante:</strong> $${restante.toFixed(2)}</p>
                <p><strong>Fecha:</strong> ${fechaAsignacion}</p>
                <p><strong>Responsable:</strong> ${responsable || 'No especificado'}</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4361ee',
        cancelButtonColor: '#f72585',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        await Swal.fire({
            icon: 'success',
            title: '¡Presupuesto asignado!',
            text: 'La asignación se ha guardado correctamente',
            confirmButtonColor: '#4361ee',
            timer: 1500,
            timerProgressBar: true
        });

        // Cerrar el modal después de la confirmación
        modal.hide();

        // Resetear el formulario
        presupuestoForm.reset();
        calcularTotales();
    }
}

// Configuración inicial de la aplicación
function setupPresupuestoApp() {
    // Elementos del formulario
    const presupuestoTotalInput = document.getElementById('presupuestoTotal');
    const categoriaInputs = document.querySelectorAll('.categoria-input');
    const guardarPresupuestoBtn = document.getElementById('guardarPresupuesto');

    // Event listeners para inputs
    presupuestoTotalInput.addEventListener('input', calcularTotales);
    categoriaInputs.forEach(input => {
        input.addEventListener('input', calcularTotales);
    });

    // Event listener para guardar presupuesto
    guardarPresupuestoBtn.addEventListener('click', handlePresupuesto);

    // Inicializar cálculos
    calcularTotales();
}

// Iniciar la aplicación
function initApp() {
    if (document.readyState === 'complete') {
        setupPresupuestoApp();
    } else {
        document.addEventListener('DOMContentLoaded', setupPresupuestoApp);
    }
}

// Inicializar
initApp();
=======
// Función para cargar SweetAlert dinámicamente y usarlo
async function showSwal(config) {
    try {
      // Cargar SweetAlert si no está disponible
      if (!window.Swal) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      
      // Mostrar el alert y devolver la promesa
      return Swal.fire(config);
    } catch (error) {
      console.error('Error al cargar SweetAlert:', error);
      // Fallback con alert nativo
      if (config.showCancelButton) {
        const confirm = window.confirm(`${config.title}\n${config.text}`);
        return { isConfirmed: confirm, isDenied: false, isDismissed: !confirm };
      } else {
        window.alert(`${config.title}\n${config.text}`);
        return { isConfirmed: true };
      }
    }
  }
  
  // Array para almacenar los presupuestos
  let presupuestos = JSON.parse(localStorage.getItem('presupuestos')) || [];
  
  // Función para inicializar la aplicación
  async function initApp() {
    // Cargar presupuestos al iniciar
    actualizarHistorial();
    
    // Configurar eventos
    setupGuardarPresupuesto();
    setupEliminarPresupuestos();
  }
  
  // Configura el evento para guardar presupuesto
  async function setupGuardarPresupuesto() {
    const guardarBtn = document.getElementById('guardarPresupuesto');
    
    guardarBtn.addEventListener('click', async function() {
      const form = document.getElementById('formPresupuesto');
      const monto = document.getElementById('montoPresupuesto');
      const fecha = document.getElementById('fechaRegistro');
      const observaciones = document.getElementById('observaciones');
      
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      // Deshabilitar botón para evitar múltiples clics
      this.disabled = true;
      
      const nuevoPresupuesto = {
        monto: parseFloat(monto.value),
        fecha: fecha.value,
        observaciones: observaciones.value,
        id: Date.now()
      };
      
      // Verificar duplicados
      const existeSimilar = presupuestos.some(p => 
        p.monto === nuevoPresupuesto.monto &&
        p.fecha === nuevoPresupuesto.fecha
      );
      
      if (existeSimilar) {
        const result = await showSwal({
          title: 'Advertencia',
          text: 'Ya existe un presupuesto con el mismo monto y fecha. ¿Deseas registrar este presupuesto de todas formas?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
          await guardarPresupuesto(nuevoPresupuesto);
        } else {
          this.disabled = false;
        }
      } else {
        await guardarPresupuesto(nuevoPresupuesto);
      }
    });
  }
  
  // Función para guardar el presupuesto
  async function guardarPresupuesto(presupuesto) {
    presupuestos.unshift(presupuesto);
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    
    await showSwal({
      title: '¡Registro exitoso!',
      html: `Monto: $${presupuesto.monto.toFixed(2)}<br>Fecha: ${presupuesto.fecha}`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
    
    // Resetear formulario
    document.getElementById('formPresupuesto').reset();
    document.getElementById('formPresupuesto').classList.remove('was-validated');
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('presupuestoModal'));
    if (modal) modal.hide();
    
    // Actualizar historial
    actualizarHistorial();
  }
  
  // Configura los eventos para eliminar presupuestos
  function setupEliminarPresupuestos() {
    document.querySelectorAll('.eliminar-presupuesto').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.getAttribute('data-id'));
        await eliminarPresupuesto(id);
      });
    });
  }
  
  // Función para eliminar presupuesto
  async function eliminarPresupuesto(id) {
    const result = await showSwal({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este presupuesto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      presupuestos = presupuestos.filter(p => p.id !== id);
      localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
      actualizarHistorial();
      
      await showSwal({
        title: 'Eliminado',
        text: 'El presupuesto ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  
  // Función para actualizar el historial (se mantiene igual)
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
  
  // Función para formatear fecha (se mantiene igual)
  function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  }
  
  // Inicializar la aplicación cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initApp);
>>>>>>> 862303e1e0b162ce979b08eebaaffdef06e379c1
