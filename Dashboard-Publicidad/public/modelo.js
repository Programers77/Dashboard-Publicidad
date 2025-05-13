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


document.addEventListener('DOMContentLoaded', function () {
    // Contador para el número de modelos
    let contadorModelos = 0;

    // Función para agregar un modelo a la tabla
    function agregarModeloATabla(modelo) {
        contadorModelos++;
        const fila = document.createElement('tr');
        fila.setAttribute('data-model-id', contadorModelos);

        fila.innerHTML = `
        <td>${contadorModelos}</td>
        <td>${modelo.nombreApellido}</td>
        <td>${modelo.camisaFranela ? `<span class="size-tag">${modelo.camisaFranela.split(' ')[0]}</span> ${modelo.camisaFranela.substring(modelo.camisaFranela.indexOf(' ') + 1)}` : '-'}</td>
        <td>${modelo.pantalon ? `<span class="size-tag">${modelo.pantalon.split(' ')[0]}</span> ${modelo.pantalon.substring(modelo.pantalon.indexOf(' ') + 1)}` : '-'}</td>
        <td>${modelo.vestidoTraje || '-'}</td>
        <td>${modelo.zapatos || '-'}</td>
        <td>${modelo.numOutfits || '1'}</td>
    `;  // ← El "1" que sobraba ha sido eliminado

        document.getElementById('tablaModelos').appendChild(fila);
    }

    // Manejar el clic en el botón Guardar
    document.getElementById('guardarModelo').addEventListener('click', function () {
        // Obtener los valores del formulario
        const modelo = {
            nombreApellido: document.getElementById('nombreApellido').value,
            camisaFranela: document.getElementById('camisaFranela').value,
            pantalon: document.getElementById('pantalon').value,
            vestidoTraje: document.getElementById('vestidoTraje').value,
            zapatos: document.getElementById('zapatos').value,
            numOutfits: document.getElementById('numOutfits').value
        };

        // Validar que el nombre no esté vacío
        if (!modelo.nombreApellido) {
            alert('El nombre y apellido son obligatorios');
            return;
        }

        // Agregar el modelo a la tabla
        agregarModeloATabla(modelo);

        // Limpiar el formulario
        document.getElementById('formAgregarModelo').reset();

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('agregarModeloModal'));
        modal.hide();
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const pautaModal = new bootstrap.Modal('#agregarPautaModal');
    const selectTipo = document.getElementById('pautaTipo');
    const inputNuevoTipo = document.getElementById('nuevoTipoPauta');

    // Mostrar/ocultar campo para nuevo tipo
    selectTipo.addEventListener('change', function () {
        inputNuevoTipo.classList.toggle('d-none', this.value !== 'custom');
        if (this.value !== 'custom') inputNuevoTipo.value = '';
    });

    // Abrir modal
    document.querySelector('.section-card:first-child .btn-add').addEventListener('click', function () {
        pautaModal.show();
    });

    // Función para verificar pautas existentes
    function pautaExistente(tipo) {
        return Array.from(document.querySelectorAll('.tag')).some(tag =>
            tag.className.includes(`tag-${tipo}`)
        );
    }

    // Función para eliminar pauta (DIRECTA)
    function configurarEliminacionPauta(tag) {
        tag.querySelector('.tag-remove').addEventListener('click', function () {
            tag.remove();
        });
    }

    // Función para agregar pauta
    function agregarPauta(tipo, nombreMostrado, descripcion = '') {
        const tagsContainer = document.querySelector('.tags-container');

        if (pautaExistente(tipo)) {
            alert(`Ya existe una pauta de tipo "${nombreMostrado}"`);
            return false;
        }

        const iconos = { gala: 'star', casual: 'tshirt', sport: 'running', default: 'tag' };
        const tag = document.createElement('span');
        tag.className = `tag tag-${tipo}`;
        tag.innerHTML = `
            <i class="fas fa-${iconos[tipo] || iconos.default}"></i>
            ${nombreMostrado}
            ${descripcion ? `<span class="tag-desc">${descripcion}</span>` : ''}
            <button class="tag-remove"><i class="fas fa-times"></i></button>
        `;

        tagsContainer.appendChild(tag);
        configurarEliminacionPauta(tag);
        return true;
    }

    // Guardar pauta
    document.getElementById('guardarPauta').addEventListener('click', function () {
        let tipo, nombreMostrado;

        if (selectTipo.value === 'custom') {
            tipo = inputNuevoTipo.value.trim().toLowerCase().replace(/\s+/g, '-');
            nombreMostrado = inputNuevoTipo.value.trim();
            if (!nombreMostrado) return alert('Ingrese el nuevo tipo de pauta');
        } else {
            tipo = selectTipo.value;
            nombreMostrado = selectTipo.options[selectTipo.selectedIndex].text;
            if (!tipo) return alert('Seleccione un tipo de pauta');
        }

        if (agregarPauta(tipo, nombreMostrado, document.getElementById('pautaDescripcion').value.trim())) {
            document.getElementById('formAgregarPauta').reset();
            inputNuevoTipo.classList.add('d-none');
            pautaModal.hide();
        }
    });

    // Configurar eliminación para pautas existentes al cargar
    document.querySelectorAll('.tags-container .tag').forEach(configurarEliminacionPauta);
});

document.addEventListener('DOMContentLoaded', function () {
    // Verificamos que Bootstrap esté cargado
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap no está cargado correctamente');
        return;
    }

    // Inicializamos el modal
    const agregarOutfitModalEl = document.getElementById('agregarOutfitModal');
    if (!agregarOutfitModalEl) {
        console.error('No se encontró el elemento del modal');
        return;
    }

    const agregarOutfitModal = new bootstrap.Modal(agregarOutfitModalEl);

    // Botón para abrir modal
    const abrirModalBtn = document.getElementById('abrirModalOutfit');
    if (abrirModalBtn) {
        abrirModalBtn.addEventListener('click', function () {
            agregarOutfitModal.show();
        });
    } else {
        console.error('No se encontró el botón para abrir el modal');
    }

    // Botón para guardar outfit
    const guardarOutfitBtn = document.getElementById('guardarOutfit');
    if (guardarOutfitBtn) {
        guardarOutfitBtn.addEventListener('click', function () {
            const nombre = document.getElementById('outfitNombre').value;
            const tipo = document.getElementById('outfitTipo').value;
            const talla = document.getElementById('outfitTalla').value;
            const color = document.getElementById('outfitColor').value;
            const codigo = document.getElementById('outfitCodigo').value;
            const imagen = document.getElementById('outfitImagen').value || 'https://via.placeholder.com/300x200?text=Outfit+Image';

            if (!nombre || !tipo || !talla || !color || !codigo) {
                alert('Por favor complete todos los campos requeridos');
                return;
            }

            addOutfitCard({
                nombre,
                tipo,
                talla,
                color,
                codigo,
                imagen,
                fechaAsignacion: new Date().toLocaleDateString('es-ES')
            });

            document.getElementById('formAgregarOutfit').reset();
            agregarOutfitModal.hide();
        });
    }

    // Función para añadir tarjeta de outfit
    function addOutfitCard(outfit) {
        const outfitsContainer = document.getElementById('outfitsContainer');
        if (!outfitsContainer) return;

        let tagClass = '';
        let tagText = '';

        switch (outfit.tipo) {
            case 'gala': tagClass = 'tag-gala'; tagText = 'Gala'; break;
            case 'casual': tagClass = 'tag-casual'; tagText = 'Casual'; break;
            case 'sport': tagClass = 'tag-sport'; tagText = 'Deportivo'; break;
        }

        const outfitCard = document.createElement('div');
        outfitCard.className = 'outfit-card';
        outfitCard.innerHTML = `
      <div class="outfit-image">
        <img src="${outfit.imagen}" alt="${outfit.nombre}" />
      </div>
      <div class="outfit-info">
        <div class="outfit-header">
          <h4 class="outfit-name">${outfit.nombre}</h4>
          <div class="outfit-actions">
            <button class="btn-icon" title="Vista rápida">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-eliminar" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="outfit-details">
          <div class="detail-row">
            <span><i class="fas fa-ruler"></i> Talla: ${outfit.talla.toUpperCase()}</span>
            <span><i class="fas fa-palette"></i> Color: ${outfit.color}</span>
          </div>
          <div class="detail-row">
            <span><i class="fas fa-barcode"></i> #${outfit.codigo}</span>
            <span><i class="fas fa-calendar"></i> Asignado: ${outfit.fechaAsignacion}</span>
          </div>
          <div class="outfit-guidelines">
            <span class="guideline-tag ${tagClass}">${tagText}</span>
          </div>
        </div>
      </div>
    `;

        // Añadir evento de eliminación
        outfitCard.querySelector('.btn-eliminar').addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres eliminar este outfit?')) {
                outfitCard.remove();
            }
        });

        outfitsContainer.prepend(outfitCard);
    }

    // Filtros
    document.getElementById('outfit-type')?.addEventListener('change', filterOutfits);
    document.getElementById('outfit-size')?.addEventListener('change', filterOutfits);

    function filterOutfits() {
        const typeFilter = document.getElementById('outfit-type')?.value || 'all';
        const sizeFilter = document.getElementById('outfit-size')?.value || 'all';
        const outfits = document.querySelectorAll('.outfit-card');

        outfits.forEach(outfit => {
            const outfitTypeElement = outfit.querySelector('.guideline-tag');
            const outfitSizeElement = outfit.querySelector('.detail-row span:first-child');

            if (!outfitTypeElement || !outfitSizeElement) return;

            const outfitType = outfitTypeElement.textContent.toLowerCase();
            const outfitSize = outfitSizeElement.textContent.split(': ')[1].trim().toLowerCase();

            const typeMatch = typeFilter === 'all' ||
                (typeFilter === 'gala' && outfitType === 'gala') ||
                (typeFilter === 'casual' && outfitType === 'casual') ||
                (typeFilter === 'sport' && outfitType === 'deportivo');

            const sizeMatch = sizeFilter === 'all' || outfitSize === sizeFilter;

            outfit.style.display = (typeMatch && sizeMatch) ? 'block' : 'none';
        });
    }

    // Añadir eventos de eliminación a los outfits existentes
    document.querySelectorAll('.outfit-card .fa-trash').forEach(icon => {
        icon.closest('button').addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres eliminar este outfit?')) {
                this.closest('.outfit-card').remove();
            }
        });
    });
});