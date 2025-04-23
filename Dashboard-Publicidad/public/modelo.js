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


