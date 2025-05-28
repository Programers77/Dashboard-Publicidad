const API_BASE_URL = "http://172.21.250.10:8000";
const FRONTEND_API = "fair-mastodon-60.clerk.accounts.dev";
let globalToken = null;

// Espera a que Clerk esté disponible


document.addEventListener("DOMContentLoaded", function () {
  // Añadir funcionalidad para resaltar filas al pasar el ratón
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "rgba(247, 37, 133, 0.05)";
    });

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "";
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Agrega event listener al contenedor padre (más eficiente)
  document
    .querySelector(".table-wrapper")
    .addEventListener("click", function (e) {
      const modelRow = e.target.closest("tr");
      if (!modelRow) return;

      // Obtén el id del modelo directamente del atributo data-model-id de la fila
      const modelId = modelRow.getAttribute("data-model-id");
      if (modelId) {
        // Previene el comportamiento por defecto solo si es un enlace
        e.preventDefault();

        // Navegación compatible con Astro
        window.location.pathname = `vista_personal`;
      }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  cargarTiposDeCuenta();

  // Guardar modelo
  document
    .getElementById("guardarModelo")
    .addEventListener("click", async function () {
      const nombres = document.getElementById("nombres").value.trim();
      const apellidos = document.getElementById("apellidos").value.trim();
      const correo = document.getElementById("correo-model").value.trim();
      const cedula = document.getElementById("cedula").value.trim();
      const telefono = document.getElementById("numero_tlf").value.trim();
      const edad = parseInt(
        document.getElementById("edad-model").value.trim(),
        10
      );
      const tipoCuenta = parseInt(document.getElementById("tipo-cuenta").value);

      const inputFoto = document.getElementById("foto_de_Perfil");
      const archivoFoto = inputFoto.files[0];

      // Validación
      if (
        !nombres ||
        !apellidos ||
        !correo ||
        !cedula ||
        !telefono ||
        !edad ||
        !tipoCuenta
      ) {
        return alert("Por favor, completa todos los campos correctamente.");
      }

      const formData = new FormData();
      formData.append("nombres", nombres);
      formData.append("apellidos", apellidos);
      formData.append("correo", correo);
      formData.append("cedula", cedula);
      formData.append("numero_tlf", telefono);
      formData.append("edad", edad);
      formData.append("tipo_de_cuenta", tipoCuenta);

      if (archivoFoto) {
        formData.append("foto_perfil", archivoFoto);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/modelos/api/head/`,
          {
            method: "POST",
            body: formData, // No se especifican headers, ya que FormData los gestiona automáticamente
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al guardar el modelo: ${errorText}`);
        }

        const { id: modeloId } = await response.json();

        // Oculta el modal del modelo
        const modal1 = bootstrap.Modal.getInstance(
          document.getElementById("agregarModeloModal")
        );
        modal1.hide();

        // Limpia formulario
        document.getElementById("formAgregarModelo").reset();

        // Asigna modeloId
        document.getElementById("modeloIdOutfit").value = modeloId;

        // Muestra modal del outfit
        new bootstrap.Modal(
          document.getElementById("agregarOutfitModal")
        ).show();
      } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar el modelo. Revisa la consola.");
      }
      
    });

  // Guardar outfit
  document
    .getElementById("guardarOutfit")
    .addEventListener("click", async function () {
      const camisa = document.getElementById("camisa").value.trim();
      const pantalon = document.getElementById("pantalonOutfit").value.trim();
      const zapatos = document.getElementById("zapatos").value.trim();
      const vestimentaAdicional = document
        .getElementById("vestimenta")
        .value.trim();
      const modeloId = parseInt(
        document.getElementById("modeloIdOutfit").value
      );
      console.log("ID del modelo:", modeloId);

      if (!camisa || !pantalon || !zapatos) {
        return alert(
          "Por favor, completa al menos los campos de camisa, pantalón y zapatos."
        );
      }

      const outfit = {
        modelo_id: modeloId,
        camisa: camisa,
        pantalon: pantalon,
        zapatos: zapatos,
        vestimenta: vestimentaAdicional,
      };

      const btn = this;
      btn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
      btn.disabled = true;

      try {
        const response = await fetch(
          `http://172.21.250.10:8000/modelos/api/tallas/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(outfit),
          }
        );
        console.log("Payload:", outfit);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error al guardar el outfit");
        }

        // Éxito
        btn.innerHTML = "Guardar Outfit";
        btn.disabled = false;

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("agregarOutfitModal")
        );
        modal.hide();

        // Limpia el formulario
        document.getElementById("formAgregarOutfit").reset();

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Modelo y outfit guardados correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al guardar outfit:", error);
        btn.innerHTML = "Guardar Outfit";
        btn.disabled = false;

        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error desconocido al guardar el outfit",
        });
      }
    });
});

// Cargar tipos de cuenta
async function cargarTiposDeCuenta() {
  try {
    const response = await fetch(
      "http://172.21.250.10:8000/modelos/api/cuenta/"
    );
    const data = await response.json();

    const select = document.getElementById("tipo-cuenta");
    select.innerHTML =
      '<option value="" disabled selected>Seleccione una opción</option>';

    data.forEach((cuenta) => {
      const option = document.createElement("option");
      option.value = cuenta.id;
      option.textContent = cuenta.cuenta;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar tipos de cuenta:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const pautaModal = new bootstrap.Modal("#agregarPautaModal");
  const selectTipo = document.getElementById("pautaTipo");
  const inputNuevoTipo = document.getElementById("nuevoTipoPauta");

  // Mostrar/ocultar campo para nuevo tipo
  selectTipo.addEventListener("change", function () {
    inputNuevoTipo.classList.toggle("d-none", this.value !== "custom");
    if (this.value !== "custom") inputNuevoTipo.value = "";
  });

  // Abrir modal
  document
    .querySelector(".section-card:first-child .btn-add")
    .addEventListener("click", function () {
      pautaModal.show();
    });

  // Función para verificar pautas existentes
  function pautaExistente(tipo) {
    return Array.from(document.querySelectorAll(".tag")).some((tag) =>
      tag.className.includes(`tag-${tipo}`)
    );
  }

  // Función para eliminar pauta (DIRECTA)
  function configurarEliminacionPauta(tag) {
    tag.querySelector(".tag-remove").addEventListener("click", function () {
      tag.remove();
    });
  }

  // Función para agregar pauta
  function agregarPauta(tipo, nombreMostrado, descripcion = "") {
    const tagsContainer = document.querySelector(".tags-container");

    if (pautaExistente(tipo)) {
      alert(`Ya existe una pauta de tipo "${nombreMostrado}"`);
      return false;
    }

    const iconos = {
      gala: "star",
      casual: "tshirt",
      sport: "running",
      default: "tag",
    };
    const tag = document.createElement("span");
    tag.className = `tag tag-${tipo}`;
    tag.innerHTML = `
            <i class="fas fa-${iconos[tipo] || iconos.default}"></i>
            ${nombreMostrado}
            ${descripcion ? `<span class="tag-desc">${descripcion}</span>` : ""}
            <button class="tag-remove"><i class="fas fa-times"></i></button>
        `;

    tagsContainer.appendChild(tag);
    configurarEliminacionPauta(tag);
    return true;
  }

  // Guardar pauta
  document
    .getElementById("guardarPauta")
    .addEventListener("click", function () {
      let tipo, nombreMostrado;

      if (selectTipo.value === "custom") {
        tipo = inputNuevoTipo.value.trim().toLowerCase().replace(/\s+/g, "-");
        nombreMostrado = inputNuevoTipo.value.trim();
        if (!nombreMostrado) return alert("Ingrese el nuevo tipo de pauta");
      } else {
        tipo = selectTipo.value;
        nombreMostrado = selectTipo.options[selectTipo.selectedIndex].text;
        if (!tipo) return alert("Seleccione un tipo de pauta");
      }

      if (
        agregarPauta(
          tipo,
          nombreMostrado,
          document.getElementById("pautaDescripcion").value.trim()
        )
      ) {
        document.getElementById("formAgregarPauta").reset();
        inputNuevoTipo.classList.add("d-none");
        pautaModal.hide();
      }
    });

  // Configurar eliminación para pautas existentes al cargar
  document
    .querySelectorAll(".tags-container .tag")
    .forEach(configurarEliminacionPauta);
});

document.addEventListener("DOMContentLoaded", function () {
  // Verificamos que Bootstrap esté cargado
  if (typeof bootstrap === "undefined") {
    console.error("Bootstrap no está cargado correctamente");
    return;
  }

  // Inicializamos el modal
  const agregarOutfitModalEl = document.getElementById("agregarOutfitModal");
  if (!agregarOutfitModalEl) {
    console.error("No se encontró el elemento del modal");
    return;
  }

  const agregarOutfitModal = new bootstrap.Modal(agregarOutfitModalEl);

  // Botón para abrir modal
  const abrirModalBtn = document.getElementById("abrirModalOutfit");
  if (abrirModalBtn) {
    abrirModalBtn.addEventListener("click", function () {
      agregarOutfitModal.show();
    });
  } else {
    console.error("No se encontró el botón para abrir el modal");
  }

  // Botón para guardar outfit
  const guardarOutfitBtn = document.getElementById("guardarOutfit");
  if (guardarOutfitBtn) {
    guardarOutfitBtn.addEventListener("click", function () {
      const nombre = document.getElementById("outfitNombre").value;
      const tipo = document.getElementById("outfitTipo").value;
      const talla = document.getElementById("outfitTalla").value;
      const color = document.getElementById("outfitColor").value;
      const codigo = document.getElementById("outfitCodigo").value;
      const imagen =
        document.getElementById("outfitImagen").value ||
        "https://via.placeholder.com/300x200?text=Outfit+Image";

      if (!nombre || !tipo || !talla || !color || !codigo) {
        alert("Por favor complete todos los campos requeridos");
        return;
      }

      addOutfitCard({
        nombre,
        tipo,
        talla,
        color,
        codigo,
        imagen,
        fechaAsignacion: new Date().toLocaleDateString("es-ES"),
      });

      document.getElementById("formAgregarOutfit").reset();
      agregarOutfitModal.hide();
    });
  }

  // Función para añadir tarjeta de outfit
  function addOutfitCard(outfit) {
    const outfitsContainer = document.getElementById("outfitsContainer");
    if (!outfitsContainer) return;

    let tagClass = "";
    let tagText = "";

    switch (outfit.tipo) {
      case "gala":
        tagClass = "tag-gala";
        tagText = "Gala";
        break;
      case "casual":
        tagClass = "tag-casual";
        tagText = "Casual";
        break;
      case "sport":
        tagClass = "tag-sport";
        tagText = "Deportivo";
        break;
    }

    const outfitCard = document.createElement("div");
    outfitCard.className = "outfit-card";
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
            <span><i class="fas fa-calendar"></i> Asignado: ${
              outfit.fechaAsignacion
            }</span>
          </div>
          <div class="outfit-guidelines">
            <span class="guideline-tag ${tagClass}">${tagText}</span>
          </div>
        </div>
      </div>
    `;

    // Añadir evento de eliminación
    outfitCard
      .querySelector(".btn-eliminar")
      .addEventListener("click", function () {
        if (confirm("¿Estás seguro de que quieres eliminar este outfit?")) {
          outfitCard.remove();
        }
      });

    outfitsContainer.prepend(outfitCard);
  }

  // Filtros
  document
    .getElementById("outfit-type")
    ?.addEventListener("change", filterOutfits);
  document
    .getElementById("outfit-size")
    ?.addEventListener("change", filterOutfits);

  function filterOutfits() {
    const typeFilter = document.getElementById("outfit-type")?.value || "all";
    const sizeFilter = document.getElementById("outfit-size")?.value || "all";
    const outfits = document.querySelectorAll(".outfit-card");

    outfits.forEach((outfit) => {
      const outfitTypeElement = outfit.querySelector(".guideline-tag");
      const outfitSizeElement = outfit.querySelector(
        ".detail-row span:first-child"
      );

      if (!outfitTypeElement || !outfitSizeElement) return;

      const outfitType = outfitTypeElement.textContent.toLowerCase();
      const outfitSize = outfitSizeElement.textContent
        .split(": ")[1]
        .trim()
        .toLowerCase();

      const typeMatch =
        typeFilter === "all" ||
        (typeFilter === "gala" && outfitType === "gala") ||
        (typeFilter === "casual" && outfitType === "casual") ||
        (typeFilter === "sport" && outfitType === "deportivo");

      const sizeMatch = sizeFilter === "all" || outfitSize === sizeFilter;

      outfit.style.display = typeMatch && sizeMatch ? "block" : "none";
    });
  }

  // Añadir eventos de eliminación a los outfits existentes
  document.querySelectorAll(".outfit-card .fa-trash").forEach((icon) => {
    icon.closest("button").addEventListener("click", function () {
      if (confirm("¿Estás seguro de que quieres eliminar este outfit?")) {
        this.closest(".outfit-card").remove();
      }
    });
  });
});
