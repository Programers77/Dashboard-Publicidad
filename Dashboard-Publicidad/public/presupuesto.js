document.addEventListener('DOMContentLoaded', function () {
    // Elementos del formulario
    const presupuestoForm = document.getElementById('presupuestoForm');
    const guardarPresupuestoBtn = document.getElementById('guardarPresupuesto');
    const presupuestoTotalInput = document.getElementById('presupuestoTotal');
    const categoriaInputs = document.querySelectorAll('.categoria-input');
    const totalAsignadoSpan = document.getElementById('totalAsignado');
    const restanteSpan = document.getElementById('restante');

    // Función para calcular totales
    function calcularTotales() {
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

    // Event listeners para inputs
    presupuestoTotalInput.addEventListener('input', calcularTotales);
    categoriaInputs.forEach(input => {
        input.addEventListener('input', calcularTotales);
    });

    // Event listener para guardar presupuesto
    guardarPresupuestoBtn.addEventListener('click', function () {
        const { totalAsignado, presupuestoTotal, restante } = calcularTotales();
        const fechaAsignacion = document.getElementById('fechaAsignacion').value;
        const responsable = document.getElementById('responsable').value.trim();

        // Validaciones
        if (!presupuestoTotal || presupuestoTotal <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe ingresar un presupuesto total válido',
                confirmButtonColor: '#4361ee'
            });
            return;
        }

        if (!fechaAsignacion) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe seleccionar una fecha de asignación',
                confirmButtonColor: '#4361ee'
            });
            return;
        }

        if (totalAsignado > presupuestoTotal) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El total asignado a categorías no puede ser mayor al presupuesto total',
                confirmButtonColor: '#4361ee'
            });
            return;
        }

        // Confirmación con SweetAlert
        Swal.fire({
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
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica para guardar los datos
                Swal.fire({
                    icon: 'success',
                    title: '¡Presupuesto asignado!',
                    text: 'La asignación se ha guardado correctamente',
                    confirmButtonColor: '#4361ee'
                }).then(() => {
                    // Cerrar el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('asignarPresupuestoModal'));
                    modal.hide();

                    // Opcional: Resetear el formulario
                    presupuestoForm.reset();
                    calcularTotales();
                });
            }
        });
    });

    // Inicializar cálculos
    calcularTotales();
});

// Función de verificación robusta
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

// Tu lógica principal con protección
async function mainAppLogic() {
    // Verificar SweetAlert2
    if (!isSweetAlertLoaded()) {
        await loadSweetAlertFallback();
    }

    // Configurar evento del botón
    document.getElementById('guardarPresupuesto').addEventListener('click', async function() {
        // Verificación final
        if (typeof Swal === 'undefined') {
            alert('Error: El sistema de notificaciones no está disponible. Recargue la página.');
            return;
        }

        // Tu lógica de validación aquí...
        const presupuestoTotal = parseFloat(document.getElementById('presupuestoTotal').value) || 0;
        
        if (presupuestoTotal <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ingrese un presupuesto válido mayor a cero',
                confirmButtonColor: '#4361ee'
            });
            return;
        }

        // Resto de tu lógica...
        Swal.fire({
            title: '¡Éxito!',
            text: 'Presupuesto guardado correctamente',
            icon: 'success'
        });
    });
}

// Iniciar la aplicación
if (document.readyState === 'complete') {
    mainAppLogic();
} else {
    document.addEventListener('DOMContentLoaded', mainAppLogic);
}