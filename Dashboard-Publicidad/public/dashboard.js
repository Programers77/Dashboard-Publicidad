// Variables de control
let hasData = false;
let isFetching = false;
let cachedData = null;
let currentFilteredData = null;

document.addEventListener('DOMContentLoaded', function() {
  if (hasData || isFetching) return;
  loadDashboardData();
  
  // Configurar event listeners para los filtros
  setupFilterListeners();
});

function setupFilterListeners() {
  const searchInput = document.getElementById('model-search');
  const statusFilter = document.getElementById('payment-status-filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
  
}

function loadDashboardData() {
  isFetching = true;
  
  // Estado inicial mínimo
  document.querySelectorAll('.card-value, .summary-amount').forEach(el => {
    el.textContent = '--';
  });

  fetch('http://10.100.39.23:8000/inicio/api/dashboard')
    .then(response => {
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data) throw new Error('Datos no válidos');
      
      cachedData = data;
      currentFilteredData = data; // Inicialmente mostrar todos los datos
      hasData = true;
      isFetching = false;
      
      updateAllSections(data);
    })
    .catch(error => {
      console.error('Error:', error);
      isFetching = false;
      showErrorState();
    });
}

function applyFilters() {
  if (!cachedData || !cachedData.datos_modelos) return;
  
  const searchTerm = document.getElementById('model-search').value.toLowerCase();
  const statusFilter = document.getElementById('payment-status-filter').value;
  
  // Filtrar los datos
  let filteredModels = [...cachedData.datos_modelos];
  
  // Aplicar filtro de búsqueda
  if (searchTerm) {
    filteredModels = filteredModels.filter(modelo => 
      (modelo.nombre_modelo && modelo.nombre_modelo.toLowerCase().includes(searchTerm)) ||
      (modelo.correo_modelo && modelo.correo_modelo.toLowerCase().includes(searchTerm)) ||
      (modelo.nombre_pauta && modelo.nombre_pauta.toLowerCase().includes(searchTerm))
    );
  }
  
  // Aplicar filtro de estado
  if (statusFilter) {
    filteredModels = filteredModels.filter(modelo => 
      modelo.estado_pauta === statusFilter
    );
  }
  
  // Actualizar los datos filtrados
  currentFilteredData = {
    ...cachedData,
    datos_modelos: filteredModels,
    pagos_completado: filteredModels.filter(m => m.estado_pauta === 'PROCESADA').length,
    pagos_pendietnes: filteredModels.filter(m => m.estado_pauta === 'ACTIVA' || m.estado_pauta === 'ATRASADA').length,
    pagos_totales_modelos: filteredModels.reduce((sum, m) => sum + (parseFloat(m.monto_pauta) || 0), 0)
  };
  
  // Actualizar solo la sección de pagos con los datos filtrados
  updatePaymentSection(currentFilteredData);
}

function updateAllSections(data) {
  // 1. Actualizar tarjetas resumen
  updateSummaryCards(data);
  
  // 2. Actualizar sección de pagos
  updatePaymentSection(data);
}

function updateSummaryCards(data) {
  const cards = document.querySelectorAll('.cards-row .card');
  if (cards.length >= 3) {
    cards[0].querySelector('.card-value').textContent = formatCurrency(data.gastos_total);
    cards[1].querySelector('.card-value').textContent = data.cantidad_campanas_act ?? 'N/D';
    cards[2].querySelector('.card-value').textContent = data.cantdida_modelos ?? 'N/D';
  }
}

function updatePaymentSection(data) {
  // Actualizar los tres indicadores de pagos
  const paymentElements = [
    { selector: '#total-pagado .summary-amount', value: data.pagos_totales_modelos, isCurrency: true },
    { selector: '#Pagos-completados .summary-amount', value: data.pagos_completado },
    { selector: '#Pagos-pendientes .summary-amount', value: data.pagos_pendietnes }
  ];

  paymentElements.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.textContent = item.isCurrency ? formatCurrency(item.value) : (item.value ?? 'N/D');
    }
  });

  // Actualizar la tabla de modelos
  updateModelsTable(data);
}

function updateModelsTable(data) {
  const tablaBody = document.querySelector('.payment-table tbody');
  if (!tablaBody) return;

  tablaBody.innerHTML = '';

  if (!data.datos_modelos?.length) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-3">
          No se encontraron modelos con los filtros aplicados
        </td>
      </tr>
    `;
    return;
  }

  data.datos_modelos.forEach(modelo => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td class="model-profile">
        <img src="${modelo.foto_perfil || 'img/avatar-default.png'}" 
             alt="${modelo.nombre_modelo || 'Modelo'}" 
             class="model-avatar"
             onerror="this.onerror=null;this.src='img/avatar-default.png'">
        <div class="model-details">
          <span class="model-name">${modelo.nombre_modelo || 'N/D'}</span>
          <span class="model-handle">${modelo.correo_modelo || 'N/A'}</span>
        </div>
      </td>
      <td class="campa">${modelo.nombre_pauta || 'Sin campaña'}</td>
      <td class="payment-amount">${formatCurrency(modelo.monto_pauta)}</td>
      <td>
        <span class="payment-status ${getStatusClass(modelo.estado_pauta)}">
          <span class="payment-status__circle"></span>
          <span class="payment-status__text">${getStatusText(modelo.estado_pauta)}</span>
        </span>
      </td>
    `;
    tablaBody.appendChild(row);
  });
}

function getStatusText(status) {
  const statusMap = {
    'ACTIVA': 'Pendiente',
    'PROCESADA': 'Pagado',
    'ATRASADA': 'Atrasado'
  };
  return statusMap[status] || status || 'Desconocido';
}

function formatCurrency(value) {
  return value !== null ? '$' + parseFloat(value).toLocaleString('es-ES') : 'N/D';
}

function getStatusClass(status) {
  const statusMap = {
    'ACTIVA': 'payment-status--pending',
    'PROCESADA': 'payment-status--completed',
    'ATRASADA': 'payment-status--overdue'
  };
  return statusMap[status] || 'payment-status--unknown';
}

function showErrorState() {
  document.querySelectorAll('.card-value, .summary-amount').forEach(el => {
    el.textContent = 'Error';
    el.style.color = '#e74c3c';
  });
  
  const tablaBody = document.querySelector('.payment-table tbody');
  if (tablaBody) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-3">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error al cargar datos
        </td>
      </tr>
    `;
  }
}