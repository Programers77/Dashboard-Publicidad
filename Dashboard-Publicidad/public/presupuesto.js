document.addEventListener('DOMContentLoaded', function() {
    const presupuestoTotal = document.getElementById('presupuestoTotal');
    const categoriaInputs = document.querySelectorAll('.categoria-input');
    const totalAsignado = document.getElementById('totalAsignado');
    const restante = document.getElementById('restante');
    
    // Función para actualizar los cálculos
    function actualizarCalculos() {
        let total = parseFloat(presupuestoTotal.value) || 0;
        let sumaAsignada = 0;
        
        // Calcular suma asignada y porcentajes
        categoriaInputs.forEach(input => {
            const valor = parseFloat(input.value) || 0;
            sumaAsignada += valor;
            
            // Actualizar porcentaje
            const porcentajeId = 'porcentaje' + input.id.charAt(0).toUpperCase() + input.id.slice(1);
            const porcentajeElement = document.getElementById(porcentajeId);
            if (porcentajeElement) {
                const porcentaje = total > 0 ? (valor / total * 100).toFixed(2) : 0;
                porcentajeElement.textContent = porcentaje + '%';
            }
        });
        
        // Actualizar resumen
        totalAsignado.textContent = '$' + sumaAsignada.toFixed(2);
        const restanteValor = total - sumaAsignada;
        restante.textContent = '$' + restanteValor.toFixed(2);
        
        // Cambiar color si hay exceso o falta
        if (restanteValor < 0) {
            restante.parentElement.classList.remove('alert-info');
            restante.parentElement.classList.add('alert-danger');
        } else if (restanteValor > 0) {
            restante.parentElement.classList.remove('alert-info');
            restante.parentElement.classList.add('alert-warning');
        } else {
            restante.parentElement.classList.remove('alert-danger', 'alert-warning');
            restante.parentElement.classList.add('alert-info');
        }
    }
    
    // Escuchar cambios en los inputs
    presupuestoTotal.addEventListener('input', actualizarCalculos);
    categoriaInputs.forEach(input => {
        input.addEventListener('input', actualizarCalculos);
    });
    
    // Botón guardar
    document.getElementById('guardarPresupuesto').addEventListener('click', function() {
        const total = parseFloat(presupuestoTotal.value) || 0;
        let sumaAsignada = 0;
        
        categoriaInputs.forEach(input => {
            sumaAsignada += parseFloat(input.value) || 0;
        });
        
        if (sumaAsignada > total) {
            alert('La suma asignada a las categorías no puede exceder el presupuesto total.');
            return;
        }
        
        if (!document.getElementById('presupuestoForm').checkValidity()) {
            alert('Por favor complete todos los campos requeridos.');
            return;
        }
        
        // Aquí iría la lógica para guardar los datos
        alert('Presupuesto asignado correctamente!');
        // Cerrar el modal
        bootstrap.Modal.getInstance(document.getElementById('asignarPresupuestoModal')).hide();
    });
});