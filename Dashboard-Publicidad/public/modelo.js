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

document.addEventListener('DOMContentLoaded', function () {
    // Agrega event listener al contenedor padre (más eficiente)
    document.querySelector('.table-wrapper').addEventListener('click', function (e) {
        const modelRow = e.target.closest('tr');
        if (!modelRow) return;

        // Obtén el id del modelo directamente del atributo data-model-id de la fila
        const modelId = modelRow.getAttribute('data-model-id');
        if (modelId) {
            // Previene el comportamiento por defecto solo si es un enlace
            e.preventDefault();

            // Navegación compatible con Astro
            window.location.pathname = `vista_personal`;
        }
    });
});


document.querySelector('.modal-footer .btn-primary').addEventListener('click', function () {
    // Obtener valores del formulario
    const ci = document.getElementById('edit-ci').value;
    const birthdate = document.getElementById('edit-birthdate').value;
    const phone = document.getElementById('edit-phone').value;
    const email = document.getElementById('edit-email').value;

    // Actualizar la vista
    document.getElementById('current-ci').textContent = ci;
    document.getElementById('current-phone').textContent = phone;
    document.getElementById('current-email').textContent = email;

    // Opcional: formatear la fecha de nacimiento si es necesario
    if (birthdate) {
        const birthDate = new Date(birthdate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        document.getElementById('current-birthdate').textContent =
            `${birthDate.toLocaleDateString()} (${age} años)`;
    }

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editarModeloModal'));
    modal.hide();
});



