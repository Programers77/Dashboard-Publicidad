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

    // Función para obtener y mostrar los datos de la API
    async function actualizarTarjetas() {
      // 1. Mostrar estado de carga (neutral)
      document.querySelectorAll('.card-value').forEach(el => {
        el.textContent = 'Cargando...';
        el.className = 'card-value loading'; // Reset classes
      });
      
      document.querySelectorAll('.card-trend').forEach(el => {
        el.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizando...';
        el.className = 'card-trend trend-neutral';
      });

      try {
        const response = await fetch('http://10.100.39.23:8000/pautas/apipautas/general/');
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        
        // 2. Actualizar con datos reales (estilo normal)
        const pendientesElement = document.querySelector('#PautasPendientes .card-value');
        const activasElement = document.querySelector('#PautasActivas .card-value');
        const inversionElement = document.querySelector('#InversionTotal .card-value');
        
        pendientesElement.textContent = data.pendientes;
        pendientesElement.className = 'card-value'; // Limpiar clases
        
        activasElement.textContent = data.activas;
        activasElement.className = 'card-value';
        
        inversionElement.textContent = `$${data.inversion_Total.toLocaleString()}`;
        inversionElement.className = 'card-value';
        
        // 3. Actualizar tendencias (puedes personalizar esto según tus datos)
        document.querySelectorAll('.card-trend').forEach(el => {
          el.className = 'card-trend trend-neutral';
          el.innerHTML = '<i class="fas fa-equals"></i> Actualizado';
        });
        
      } catch (error) {
        console.error('Error al obtener datos:', error);
        
        // 4. Solo mostrar error en rojo cuando falla
        document.querySelectorAll('.card-value').forEach(el => {
          el.textContent = 'Error';
          el.className = 'card-value error'; // Aplicar clase de error
        });
        
        document.querySelectorAll('.card-trend').forEach(el => {
          el.className = 'card-trend trend-error';
          el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al cargar';
        });
        
        // 5. Intentar nuevamente después de 10 segundos
        setTimeout(actualizarTarjetas, 10000);
      }
    }

    // Iniciar la carga al montar la página
    document.addEventListener('DOMContentLoaded', actualizarTarjetas);

    // Actualizar periódicamente cada 30 segundos
    const intervalId = setInterval(actualizarTarjetas, 30000);

    async function cargarTablaPautas() {
      const tbody = document.querySelector('.pautas-table tbody');
      
      try {
        // Mostrar estado de carga
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="loading-message">
              <i class="fas fa-spinner fa-spin"></i> Cargando datos de pautas...
            </td>
          </tr>
        `;
        
        const response = await fetch('http://10.100.39.23:8000/pautas/apipautas/general/');
        if (!response.ok) throw new Error('Error al cargar los datos');
        
        const data = await response.json();
        
        // Si no hay pautas, mostrar mensaje
        if (!data.lista_pautas || data.lista_pautas.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="no-data-message">
                No se encontraron pautas registradas
              </td>
            </tr>
          `;
          return;
        }
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Procesar cada pauta (el mismo código que teníamos antes)
        data.lista_pautas.forEach(pauta => {
          const row = document.createElement('tr');
          
          // ... (todo el código de creación de filas que teníamos antes)
          
          tbody.appendChild(row);
        });
        
      } catch (error) {
        console.error('Error al cargar la tabla de pautas:', error);
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="error-message">
              <i class="fas fa-exclamation-triangle"></i> Error al cargar los datos. Intente nuevamente.
            </td>
          </tr>
        `;
        
        // Reintentar después de 5 segundos
        setTimeout(cargarTablaPautas, 5000);
      }
    }

    // Llamar a la función cuando la página cargue
    document.addEventListener('DOMContentLoaded', cargarTablaPautas);

  });