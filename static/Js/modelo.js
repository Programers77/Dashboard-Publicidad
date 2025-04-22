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