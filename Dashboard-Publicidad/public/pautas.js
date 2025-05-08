// Funcionalidad básica para el modal
document.addEventListener('DOMContentLoaded', function() {
    const btnAddPauta = document.getElementById('btnAddPauta');
    const pautaModal = document.getElementById('pautaModal');
    const closeModal = document.getElementById('closeModal');
    const cancelPauta = document.getElementById('cancelPauta');
    const pautaForm = document.getElementById('pautaForm');
    
    // Abrir modal
    btnAddPauta.addEventListener('click', function() {
      pautaModal.classList.add('active');
    });
    
    // Cerrar modal
    function closeModalHandler() {
      pautaModal.classList.remove('active');
    }
    
    closeModal.addEventListener('click', closeModalHandler);
    cancelPauta.addEventListener('click', closeModalHandler);
    
    // Evitar que el modal se cierre al hacer clic dentro del contenido
    pautaModal.querySelector('.modal-container').addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    pautaModal.addEventListener('click', closeModalHandler);
    
    // Manejar envío del formulario
    pautaForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Aquí iría la lógica para guardar la pauta
      alert('Pauta guardada con éxito!');
      closeModalHandler();
    });
  });