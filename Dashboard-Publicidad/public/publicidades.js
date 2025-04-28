function loadSweetAlert() {
    return new Promise((resolve, reject) => {
      if (window.Swal) return resolve(); // Ya está cargado
  
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Uso en tu código
  document.addEventListener('DOMContentLoaded', async function() {
    // Carga SweetAlert antes de usarlo
    await loadSweetAlert().catch(() => {
      console.error('No se pudo cargar SweetAlert');
      // Puedes fallar silenciosamente o mostrar un alert nativo
    });
    
    // Elementos del DOM
    const newAdButton = document.getElementById('new-ad-button');
    const adModal = new bootstrap.Modal(document.getElementById('adModal'));
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const submitButton = document.getElementById('submitButton');
    const adNameInput = document.getElementById('adName');
    const totalInput = document.getElementById('total');
    
    // Campos numéricos para calcular el total
    const numericInputs = [
      'lease', 'installationPrice', 'uninstallationPrice', 
      'municipalTax', 'corpoelecTax', 'inttTax', 'monthlyTax'
    ];
    
    // Evento para abrir el modal
    newAdButton.addEventListener('click', function() {
      resetForm();
      adModal.show();
    });
    
    // Evento para el botón Siguiente
    nextButton.addEventListener('click', function() {
      if (adNameInput.value.trim() === '') {
        Swal.fire({
          icon: 'error',
          title: 'Campo requerido',
          text: 'Por favor ingrese el nombre de la publicidad',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      
      step1.style.display = 'none';
      step2.style.display = 'block';
      nextButton.style.display = 'none';
      backButton.style.display = 'block';
      submitButton.style.display = 'block';
      
      // Actualizar el título del modal con el nombre
      document.getElementById('adModalLabel').textContent = `Nueva Publicidad: ${adNameInput.value}`;
    });
    
    // Evento para el botón Atrás
    backButton.addEventListener('click', function() {
      step1.style.display = 'block';
      step2.style.display = 'none';
      nextButton.style.display = 'block';
      backButton.style.display = 'none';
      submitButton.style.display = 'none';
      
      // Restaurar el título del modal
      document.getElementById('adModalLabel').textContent = 'Nueva Publicidad';
    });
    
    // Evento para calcular el total cuando cambian los valores
    numericInputs.forEach(id => {
      document.getElementById(id).addEventListener('input', calculateTotal);
    });
    
    // Evento para enviar el formulario
    submitButton.addEventListener('click', function() {
      // Aquí puedes agregar la lógica para guardar los datos
      const adData = {
        name: adNameInput.value,
        installationDate: document.getElementById('installationDate').value,
        paymentDate: document.getElementById('paymentDate').value,
        uninstallationDate: document.getElementById('uninstallationDate').value,
        location: document.getElementById('location').value,
        production: document.getElementById('production').value,
        lease: parseFloat(document.getElementById('lease').value) || 0,
        installationPrice: parseFloat(document.getElementById('installationPrice').value) || 0,
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        uninstallationPrice: parseFloat(document.getElementById('uninstallationPrice').value) || 0,
        municipalTax: parseFloat(document.getElementById('municipalTax').value) || 0,
        corpoelecTax: parseFloat(document.getElementById('corpoelecTax').value) || 0,
        inttTax: parseFloat(document.getElementById('inttTax').value) || 0,
        monthlyTax: parseFloat(document.getElementById('monthlyTax').value) || 0,
        total: parseFloat(totalInput.value) || 0
      };
      
      console.log('Datos a guardar:', adData);
      
      Swal.fire({
        icon: 'success',
        title: 'Publicidad guardada',
        text: `Publicidad "${adData.name}" guardada exitosamente`,
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          adModal.hide();
        }
      });
    });
    
    // Función para calcular el total
    function calculateTotal() {
      let total = 0;
      
      numericInputs.forEach(id => {
        const value = parseFloat(document.getElementById(id).value) || 0;
        total += value;
      });
      
      // Multiplicar por la cantidad si es necesario
      const quantity = parseInt(document.getElementById('quantity').value) || 1;
      total *= quantity;
      
      totalInput.value = total.toFixed(2);
    }
    
    // Función para resetear el formulario
    function resetForm() {
      step1.style.display = 'block';
      step2.style.display = 'none';
      nextButton.style.display = 'block';
      backButton.style.display = 'none';
      submitButton.style.display = 'none';
      
      document.getElementById('adForm').reset();
      adNameInput.value = '';
      totalInput.value = '';
      document.getElementById('adModalLabel').textContent = 'Nueva Publicidad';
    }
});