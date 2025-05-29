document.addEventListener('DOMContentLoaded', function() {
    
    
    
    // 1. Funciones para manejar datos de la API
    function formatCurrency(value) {
        return '$' + parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function updateCards(data) {
        // Actualizar tarjeta de presupuesto total
        const presupuestoCard = document.querySelector('#presupuesto_total .card-value');
        const gastadoTrend = document.querySelector('#presupuesto_total .trend-value');
        
        presupuestoCard.textContent = `$${data.presupuesto_total}`;
        gastadoTrend.textContent = `Gastado: $${data.gastado} (${data.porcentaje.toFixed(2)}%)`;
      
        // Actualizar tarjeta de restante
        const restanteCard = document.querySelector('#restante .card-value');
        restanteCard.textContent = `$${data.restante}`;
      
        // Actualizar tarjeta de mes más frecuente
        const mesesEnEspanol = {
            'January': 'Enero', 'February': 'Febrero', 'March': 'Marzo',
            'April': 'Abril', 'May': 'Mayo', 'June': 'Junio',
            'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre',
            'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre'
        };
        
        const mesCard = document.querySelector('#mes_mas_frecuente .card-value');
        const mesTrend = document.querySelector('#mes_mas_frecuente .trend-value');
        
        const mesEnEspanol = mesesEnEspanol[data.mes_masfrecuente.mes] || data.mes_masfrecuente.mes;
        mesCard.textContent = mesEnEspanol;
        
        // Calcular el porcentaje que representa el mes más frecuente del total gastado
        const gastadoNumerico = parseFloat(data.gastado.replace(/,/g, ''));
        const porcentajeMes = (data.mes_masfrecuente.Cuenta / gastadoNumerico) * 100;
        mesTrend.textContent = `$${data.mes_masfrecuente.Cuenta.toLocaleString('en-US')} (${porcentajeMes.toFixed(1)}%)`;
    }

    function updateCampanasTable(campanasData) {
        const tableBody = document.querySelector('#tablaCampanas tbody');
        tableBody.innerHTML = ''; // Limpiar tabla existente

        // Mapeo de meses (posición del array -> nombre del mes)
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Procesar cada tipo de campaña
        Object.entries(campanasData).forEach(([nombre, datosCampana], index) => {
            const row = document.createElement('tr');
            row.style.setProperty('--row-order', index);
            row.dataset.campanaId = datosCampana.id; // Guardar el ID en el dataset de la fila

            // Calcular el total de la campaña
            const total = datosCampana.valores.reduce((sum, value) => sum + value, 0);

            // Crear celda de descripción
            const descCell = document.createElement('td');
            descCell.innerHTML = `
                <div class="category-wrapper">
                    <i class="fab fa-${nombre.toLowerCase()} icon-category"></i>
                    ${nombre.toUpperCase()}
                </div>
            `;

            // Crear celdas de meses
            const monthCells = datosCampana.valores.map((value, monthIndex) => {
                const cell = document.createElement('td');
                cell.dataset.mes = meses[monthIndex]; // Agregar atributo data-mes
                
                if (value === 0) {
                    cell.className = 'amount-cell zero';
                    cell.textContent = '$0.00';
                } else {
                    cell.className = 'amount-cell';
                    cell.innerHTML = `
                        ${formatCurrency(value)}
                        <div class="value-bar" style="width: ${(value / Math.max(...datosCampana.valores.filter(v => v > 0)) * 100 || 0)}%"></div>
                    `;
                }
                return cell;
            });

            // Crear celda de total
            const totalCell = document.createElement('td');
            totalCell.className = 'amount-cell';
            totalCell.innerHTML = `
                ${formatCurrency(total)}
                <div class="value-bar" style="width: 100%"></div>
            `;

            // Construir la fila
            row.appendChild(descCell);
            monthCells.forEach(cell => row.appendChild(cell));
            row.appendChild(totalCell);

            tableBody.appendChild(row);
        });

        // Agregar fila de totales
        addTotalRow(campanasData);
        
        // Añadir interactividad a las filas después de crearlas
        addRowInteractivity();
    }

    // Función addTotalRow también necesita ser actualizada para trabajar con la nueva estructura
    function addTotalRow(campanasData) {
        const tableBody = document.querySelector('#tablaCampanas tbody');
        const row = document.createElement('tr');
        row.className = 'total-row';
        row.style.setProperty('--row-order', Object.keys(campanasData).length);

        // Mapeo de meses
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        // Calcular totales por mes
        const mesesTotales = Array(12).fill(0);
        Object.values(campanasData).forEach(campana => {
            campana.valores.forEach((value, index) => {
                mesesTotales[index] += value;
            });
        });

        // Calcular gran total
        const granTotal = mesesTotales.reduce((sum, value) => sum + value, 0);

        // Crear celda de descripción
        const descCell = document.createElement('td');
        descCell.innerHTML = `
            <div class="category-wrapper">
                <i class="fas fa-calculator icon-category"></i>
                TOTALES
            </div>
        `;

        // Crear celdas de meses
        const monthCells = mesesTotales.map(value => {
            const cell = document.createElement('td');
            if (value === 0) {
                cell.className = 'amount-cell zero';
                cell.textContent = '$0.00';
            } else {
                cell.className = 'amount-cell';
                cell.innerHTML = `
                    ${formatCurrency(value)}
                    <div class="value-bar" style="width: ${(value / Math.max(...mesesTotales.filter(v => v > 0)) * 100 || 0)}%"></div>
                `;
            }
            return cell;
        });

        // Crear celda de gran total
        const totalCell = document.createElement('td');
        totalCell.className = 'amount-cell grand-total';
        totalCell.innerHTML = `
            ${formatCurrency(granTotal)}
            <div class="value-bar" style="width: 100%"></div>
        `;

        // Construir la fila
        row.appendChild(descCell);
        monthCells.forEach(cell => row.appendChild(cell));
        row.appendChild(totalCell);

        tableBody.appendChild(row);
    }

    // 2. Funciones para interactividad de la tabla
    function addRowInteractivity() {
        const rows = document.querySelectorAll('#tablaCampanas tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(247, 37, 133, 0.05)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    }

    // 3. Función para agregar nueva campaña
    function agregarNuevaCampana(nombreCampana) {
        const fechaActual = new Date().toISOString().split('T')[0];
        
        const datos = {
            "nombre_campañas": nombreCampana,
            "fecha_creacion": fechaActual,
            "activa": true
        };
        
        fetch('http://172.21.250.10:8000/campanas/apihead/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            nuevaCampanaId = data.id;
            
            // Cierra el modal de campaña
            const modalCampana = bootstrap.Modal.getInstance(document.getElementById('agregarCampanaModal'));
            modalCampana.hide();
            
            // Recarga los datos para actualizar la vista
            cargarDatosAPI().then(() => {
                // Muestra SweetAlert de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Campaña registrada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                // Abre el modal de gastos después de actualizar
                const modalGastos = new bootstrap.Modal(document.getElementById('agregarGastosModal'));
                modalGastos.show();
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar la campaña: ' + error.message
            });
        });
    }

    // Funciones mejoradas
    function showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Función para cargar datos de la API
    function cargarDatosAPI() {
        return fetch(
          "http://172.21.250.10:8000/campanas/apidescrip/resumencampanas/"
        )
          .then((response) => {
            if (!response.ok)
              throw new Error("Error en la respuesta del servidor");
            return response.json();
          })
          .then((data) => {
            updateCards(data);

            if (data.campanas) {
              updateCampanasTable(data.campanas);
            }
            return data; // Devuelve los datos para poder encadenar
          })
          .catch((error) => {
            console.error("Error al obtener datos de la API:", error);
            throw error; // Propaga el error
          });
    }
    
    // Variable para guardar el ID de la campaña recién creada
    let nuevaCampanaId = null;

     // Función para limpiar el modal
     function limpiarModal() {
        document.getElementById('nombreCampana').value = '';
    }

    // Event listeners para cuando los modales se cierran
    document.getElementById('agregarCampanaModal').addEventListener('hidden.bs.modal', function() {
        limpiarModal('agregarCampanaModal');
    });
    
    document.getElementById('agregarGastosModal').addEventListener('hidden.bs.modal', function() {
        limpiarModal('agregarGastosModal');
    });

    // Función para agregar nueva campaña (modificada)
    function agregarNuevaCampana(nombreCampana) {
        const fechaActual = new Date().toISOString().split('T')[0];
        
        const datos = {
            "nombre_campañas": nombreCampana,
            "fecha_creacion": fechaActual,
            "activa": true
        };
        
        fetch("http://172.21.250.10:8000/campanas/apihead/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        })
          .then((response) => {
            if (!response.ok)
              throw new Error("Error en la respuesta del servidor");
            return response.json();
          })
          .then((data) => {
            console.log("Success:", data);
            nuevaCampanaId = data.id; // Guardamos el ID de la nueva campaña

            // Cierra el modal de campaña y abre el de gastos
            const modalCampana = bootstrap.Modal.getInstance(
              document.getElementById("agregarCampanaModal")
            );
            modalCampana.hide();

            const modalGastos = new bootstrap.Modal(
              document.getElementById("agregarGastosModal")
            );
            modalGastos.show();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Error al registrar la campaña: " + error.message);
          });
    }
    
    // Función para cargar SweetAlert2 dinámicamente
    function loadSweetAlert() {
        return new Promise((resolve, reject) => {
            if (typeof Swal !== 'undefined') {
                resolve(); // Ya está cargado
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Error al cargar SweetAlert2'));
            document.head.appendChild(script);
        });
    }

    // Función para mostrar alertas que maneja la carga dinámica
    async function showAlert(config) {
        try {
            await loadSweetAlert();
            return Swal.fire(config);
        } catch (error) {
            console.error('Error con SweetAlert:', error);
            // Fallback básico con alert nativo
            alert(config.title + '\n\n' + (config.text || ''));
            return { isConfirmed: true }; // Simulamos confirmación para continuar el flujo
        }
    }

    // Modificar todas las llamadas a Swal.fire() en tu código
    // Ejemplo de modificación en registrarGastos():
    async function registrarGastos() {
        // Verificar SweetAlert
        try {
            await loadSweetAlert();
        } catch (error) {
            console.error('Error al cargar SweetAlert:', error);
            alert('Error en el sistema: No se pudo cargar el módulo de notificaciones');
            return;
        }

        const formGastos = document.getElementById('formGastos');
        if (!formGastos) {
            await showAlert({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró el formulario de gastos'
            });
            return;
        }

        if (!formGastos.checkValidity()) {
            formGastos.reportValidity();
            return;
        }
    
        // Obtener valores de forma segura
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : null;
        };
    
        const datosGastos = {
            fecha_pago: getValue('fechaPago'),
            tipo_evento: getValue('tipoEvento'),
            tipo_contendido: getValue('tipoContenido'),
            duracion: parseInt(getValue('duracion')) || 0,
            alcance: parseInt(getValue('alcance')) || 0,
            inversion: parseFloat(getValue('inversion')) || 0,
            head_id: nuevaCampanaId
        };
    
        // Validación adicional
        if (!datosGastos.head_id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se ha seleccionado una campaña válida',
                confirmButtonClass: 'btn btn-primary'
            });
            return;
        }
    
        // Mostrar loader
        Swal.fire({
            title: 'Registrando gastos...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    
        fetch("http://172.21.250.10:8000/campanas/apidescrip/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosGastos),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((err) => {
                throw new Error(
                  err.message || `Error del servidor: ${response.status}`
                );
              });
            }
            return response.json();
          })
          .then((data) => {
            Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: "Gastos registrados correctamente",
              confirmButtonClass: "btn btn-primary",
            }).then(() => {
              // Cerrar modal
              const modal = bootstrap.Modal.getInstance(
                document.getElementById("agregarGastosModal")
              );
              if (modal) modal.hide();

              // Limpiar backdrop
              document
                .querySelectorAll(".modal-backdrop")
                .forEach((el) => el.remove());
              document.body.classList.remove("modal-open");

              // Recargar datos
              cargarDatosAPI();
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.message,
              confirmButtonClass: "btn btn-primary",
            });
          });
    }
    
    // Event listener para el botón de guardar campaña
    document.getElementById('guardarCampanaBtn').addEventListener('click', function() {
        const nombreCampana = document.getElementById('nombreCampana').value.trim();
        
        if (nombreCampana === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa un nombre para la campaña',
                confirmButtonClass: 'btn btn-primary'
            });
            return;
        }
        
        agregarNuevaCampana(nombreCampana);
    });
    
    // Modificar el evento click del botón guardarGastosBtn
    document.getElementById('guardarGastosBtn').addEventListener('click', async function() {
        if (!document.getElementById('formGastos').checkValidity()) {
            await showAlert({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos requeridos'
            });
            return;
        }
        
        await registrarGastos();
    });
    // Cargar datos iniciales
    cargarDatosAPI();

    function llenarNuevoSelectCampanas() {
        const select = document.getElementById('nuevaCampanaSelect');
        
        // Limpiar opciones existentes (excepto la primera opción por defecto)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Obtener todas las filas de la tabla (excepto la fila de totales)
        const filas = document.querySelectorAll('#tablaCampanas tbody tr:not(.total-row)');
        
        // Crear un conjunto para evitar duplicados
        const nombresCampanas = new Set();
        
        filas.forEach(fila => {
            // Obtener el ID de la campaña del atributo data-campana-id
            const campanaId = fila.dataset.campanaId;
            
            // Obtener el div que contiene el nombre de la campaña
            const categoryWrapper = fila.querySelector('.category-wrapper');
            if (categoryWrapper && campanaId) {
                // Extraer el texto y limpiarlo
                let nombreCampana = categoryWrapper.textContent.trim();
                
                // Eliminar "CAMPAÑAS " del inicio si existe y cualquier texto después (como íconos)
                nombreCampana = nombreCampana.replace(/^CAMPAÑAS\s+/i, '')
                                            .replace(/\s+/g, ' ')
                                            .trim();
                
                // Solo agregar si no está vacío y no es un duplicado
                if (nombreCampana && !nombresCampanas.has(nombreCampana)) {
                    nombresCampanas.add(nombreCampana);
                    
                    const option = document.createElement('option');
                    option.value = campanaId; // Usamos el ID como valor
                    option.textContent = nombreCampana; // Mostramos el nombre
                    option.dataset.nombre = nombreCampana; // Almacenamos el nombre en dataset
                    select.appendChild(option);
                }
            }
        });
        
        // Si no hay campañas, agregar un mensaje
        if (nombresCampanas.size === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay campañas disponibles';
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);
        }
    }

    // Evento cuando se abre el NUEVO modal
    document.getElementById('nuevoGastosModal').addEventListener('show.bs.modal', llenarNuevoSelectCampanas);

   // Manejar el envío del NUEVO formulario de gastos
    document.getElementById('nuevoGuardarGastosBtn').addEventListener('click', async function() {
        const form = document.getElementById('nuevoFormGastos');
        
        if (form.checkValidity()) {
            const datosGasto = {
                fecha_pago: document.getElementById('nuevaFechaPago').value,
                tipo_evento: document.getElementById('nuevoTipoEvento').value,
                tipo_contendido: document.getElementById('nuevoTipoContenido').value,
                duracion: parseInt(document.getElementById('nuevaDuracion').value),
                alcance: parseInt(document.getElementById('nuevoAlcance').value),
                inversion: parseFloat(document.getElementById('nuevaInversion').value),
                head_id: parseInt(document.getElementById('nuevaCampanaSelect').value)
            };
            
            try {
                // Verificar si SweetAlert2 está disponible
                const showAlert = (config) => {
                    if (typeof Swal !== 'undefined') {
                        return Swal.fire(config);
                    } else {
                        console.warn('SweetAlert2 no cargado:', config);
                        alert(config.text || 'Operación completada');
                    }
                
                };
                
                await showAlert({
                    title: 'Enviando datos...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        if (typeof Swal !== 'undefined') Swal.showLoading();
                    }
                });
                
                const response = await fetch('http://172.21.250.10:8000/campanas/apidescrip/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosGasto)
                });
                
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoGastosModal'));
                modal.hide();
                form.reset();
                
                await showAlert({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Los gastos se han registrado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                
            } catch (error) {
                console.error('Error:', error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al registrar los gastos'
                    });
                } else {
                    alert('Error: ' + error.message);
                }
            }
        } else {
            form.reportValidity();
        }
    });   
});