document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('budgetModal');
    const openModalBtn = document.querySelector('.budget-actions .btn-primary');
    const closeModalBtn = document.getElementById('closeBudgetModal');
    const cancelBtn = document.getElementById('cancelBudget');
    const budgetPeriod = document.getElementById('budgetPeriod');
    const specificDatesGroup = document.getElementById('specificDatesGroup');
    
    // Verifica que todos los elementos existan
    if (!modal || !openModalBtn || !closeModalBtn || !cancelBtn || !budgetPeriod || !specificDatesGroup) {
        console.error('No se encontraron todos los elementos necesarios para el modal');
        return;
    }
    
    // Función para abrir modal
    function openModal() {
        console.log('Abriendo modal'); // Para depuración
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Función para cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event listeners con verificación
    openModalBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Mostrar/ocultar fechas específicas
    budgetPeriod.addEventListener('change', function(e) {
        specificDatesGroup.style.display = e.target.value === 'specific' ? 'block' : 'none';
    });
    
    // Manejar el envío del formulario
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Presupuesto asignado correctamente');
            closeModal();
            e.target.reset();
            specificDatesGroup.style.display = 'none';
        });
    }
});