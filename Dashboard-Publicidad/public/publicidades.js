document.addEventListener('DOMContentLoaded', function() {
  // 1. Selección de elementos del DOM
  const newAdButton = document.getElementById('new-ad-button');
  const adNameModal = new bootstrap.Modal(document.getElementById('adNameModal'));
  const adDetailsModal = new bootstrap.Modal(document.getElementById('adDetailsModal'));
  const adNameForm = document.getElementById('adNameForm');
  const adDetailsForm = document.getElementById('adDetailsForm');
  const campaignNameInput = document.getElementById('campaignName');
  const displayCampaignName = document.getElementById('displayCampaignName');
  const backToNameModalBtn = document.getElementById('backToNameModal');
  const itemsContainer = document.getElementById('itemsContainer');
  const addMoreItemsBtn = document.getElementById('addMoreItems');
  const continueBtn = adNameForm.querySelector('button[type="submit"]');

  // Variable para almacenar temporalmente los items
  let temporaryItems = [];

  // Función para resetear completamente los modales
  function resetModals() {
    adNameForm.reset();
    adDetailsForm.reset();
    temporaryItems = [];
    continueBtn.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Continuar';
    continueBtn.disabled = false;
    
    itemsContainer.innerHTML = `
      <div class="item-group mb-3 border-bottom pb-3">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Concepto</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="fas fa-tag text-primary"></i></span>
              <input type="text" class="form-control item-name" placeholder="Ej: Espacio en revista" required>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Valor</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="fas fa-dollar-sign text-primary"></i></span>
              <input type="number" class="form-control item-value" placeholder="0.00" min="0" step="0.01" required>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Mostrar modal inicial
  newAdButton.addEventListener('click', function() {
    resetModals();
    adNameModal.show();
  });

  // 3. Manejar el paso al modal de detalles (solo guarda el nombre en memoria)
  adNameForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombrePublicidad = campaignNameInput.value.trim();
    
    if (!nombrePublicidad) {
      alert('Por favor ingrese un nombre para la campaña');
      return;
    }

    // Mostrar el nombre en el siguiente modal
    displayCampaignName.textContent = nombrePublicidad;
    
    adNameModal.hide();
    adDetailsModal.show();
  });

  // 4. Añadir más campos de items
  addMoreItemsBtn.addEventListener('click', function() {
    const newItemGroup = document.createElement('div');
    newItemGroup.className = 'item-group mb-3 border-bottom pb-3';
    newItemGroup.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Concepto</label>
          <div class="input-group">
            <span class="input-group-text bg-light"><i class="fas fa-tag text-primary"></i></span>
            <input type="text" class="form-control item-name" placeholder="Ej: Espacio en revista" required>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Valor</label>
          <div class="input-group">
            <span class="input-group-text bg-light"><i class="fas fa-dollar-sign text-primary"></i></span>
            <input type="number" class="form-control item-value" placeholder="0.00" min="0" step="0.01" required>
          </div>
        </div>
        <div class="col-12 text-end">
          <button type="button" class="btn btn-sm btn-outline-danger remove-item">
            <i class="fas fa-trash-alt me-1"></i>Eliminar Concepto
          </button>
        </div>
      </div>
    `;
    
    itemsContainer.appendChild(newItemGroup);
    
    newItemGroup.querySelector('.remove-item').addEventListener('click', function() {
      itemsContainer.removeChild(newItemGroup);
    });
  });

  // 5. Manejar el envío final de todos los datos
  adDetailsForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombrePublicidad = campaignNameInput.value.trim();
    if (!nombrePublicidad) {
      alert('Error: Nombre de campaña no encontrado');
      return;
    }

    // Recolectar todos los items
    const items = [];
    const itemGroups = itemsContainer.querySelectorAll('.item-group');
    
    itemGroups.forEach(group => {
      const name = group.querySelector('.item-name').value.trim();
      const value = group.querySelector('.item-value').value.trim();
      
      if (name && value) {
        items.push({ name, value });
      }
    });

    if (items.length === 0) {
      alert('Por favor ingrese al menos un concepto válido');
      return;
    }

    const submitBtn = adDetailsForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
      // Mostrar estado de carga
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';
      submitBtn.disabled = true;

      // PASO 1: Crear la publicidad (solo nombre)
      const createResponse = await fetch('http://10.100.39.23:8000/publicidad/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombrePublicidad
        })
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.message || createData.detail || 'Error al crear la publicidad');
      }

      // Obtener ID de la publicidad creada
      const publicidadId = createData.id;

      // PASO 2: Crear los items asociados
      const datosItems = {};
      items.forEach(item => {
        datosItems[item.name] = item.value;
      });

      const itemsResponse = await fetch('http://10.100.39.23:8000/publicidad/api/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datos: datosItems,
          id_publicidad: publicidadId
        })
      });

      const itemsData = await itemsResponse.json();

      if (!itemsResponse.ok) {
        throw new Error(itemsData.message || itemsData.detail || 'Error al guardar los items');
      }

      alert('Campaña creada exitosamente!');
      adDetailsModal.hide();
      resetModals();

    } catch (error) {
      console.error('Error en el proceso:', error);
      alert(`Error: ${error.message}`);
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });

  // 6. Botón para regresar al modal de nombre
  backToNameModalBtn.addEventListener('click', function() {
    adDetailsModal.hide();
    adNameModal.show();
  });
});