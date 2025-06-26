let modeloData = null;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modeloId = urlParams.get("id");

  if (modeloId) {
    await cargarDatosDelModelo(modeloId);
    configurarModalEdicion();
    // Llama a configurarMostrarImagenPerfil DESPUÉS de cargarDatosDelModelo
    configurarMostrarImagenPerfil();
  }
});

async function cargarDatosDelModelo(modeloId) {
  try {
    const response = await fetch(
      `http://172.21.250.10:8000/modelos/api/head/detallespersonales/?id=${modeloId}`
    );
    if (!response.ok) throw new Error("Error en la respuesta del servidor");

    modeloData = await response.json();
    console.log("Datos del modelo:", modeloData);

    // Actualizar la vista con TODOS los datos
    const detalles = modeloData.Detalles[0];
    document.getElementById("nombre-perfil").innerText = detalles.nombre;
    document.getElementById("id-perfil").innerText = detalles.codigo_wallet;
    document.getElementById("cedula-perfil").innerText = detalles.cedula;
    document.getElementById("perfil-email").innerText = detalles.correo;
    document.getElementById("perfil-telefono").innerText = detalles.telefono;
    document.getElementById("perfil-edad").innerText = detalles.edad;

    // Mostrar la foto de perfil si existe
    const imgPerfil = document.getElementById("foto-perfill");
    if (detalles.foto_perfil) {
      // **¡Importante!** Asegúrate de que esta URL sea accesible desde el frontend
      imgPerfil.src = detalles.foto_perfil;
      imgPerfil.alt = "Foto del modelo";
    } else {
      imgPerfil.src = "/descarga.png"; // imagen por defecto
      imgPerfil.alt = "Foto del modelo por defecto";
    }

    if (detalles.pautas_asignadas && detalles.pautas_asignadas.nombres) {
      const tagscontainer = document.querySelector(".tags-container");
      tagscontainer.innerHTML = "";

      detalles.pautas_asignadas.nombres.forEach((pauta) => {
        console.log("Pautas asignadas:", detalles.pautas_asignadas.nombres);
        const pautaElement = document.createElement("span");
        pautaElement.classList.add("tag", "tag-gala");

        const icono = document.createElement("i");
        icono.classList.add("fas", "fa-star");
        pautaElement.appendChild(icono);

        pautaElement.appendChild(document.createTextNode(pauta));

        // --- INICIO DE CAMBIO: Se elimina el código para el botón de eliminar ---
        // Anteriormente tenías:
        // const botonEliminar = document.createElement("button");
        // botonEliminar.classList.add("tag-remove");
        // const iconoEliminar = document.createElement("i");
        // iconoEliminar.classList.add("fas", "fa-times");
        // botonEliminar.appendChild(iconoEliminar);
        // pautaElement.appendChild(botonEliminar);
        // --- FIN DE CAMBIO ---

        // Se asegura que solo se agregue el texto de la pauta al innerText si no hay otros elementos
        // Como ya estás haciendo pautaElement.appendChild(document.createTextNode(pauta));
        // esta línea es redundante y podría sobrescribir el icono.
        // pautaElement.innerText = pauta;

        tagscontainer.appendChild(pautaElement);
      });
    } else {
      const tagsContainer = document.querySelector(".tags-container");
      if (tagsContainer) {
        tagsContainer.innerText = "No hay pautas asignadas";
      }
    }

    console.log("Detalles del modelo:", detalles);
    document.getElementById("saldo").innerText = `$${detalles.saldo}`;
    const transacciones = detalles.transaciones;

    let totalCredito = 0;
    let totalDebito = 0;

    transacciones.forEach((tx) => {
      if (tx.tipo_de_movimiento === "CREDITO") {
        totalCredito += tx.monto;
      } else if (tx.tipo_de_movimiento === "DEBITO") {
        totalDebito += tx.monto;
      }
    });

    document
      .getElementById("balance-ingresos")
      .querySelector(".credit").innerText = `$${totalCredito.toFixed(2)}`;
    document
      .getElementById("balance-gastos")
      .querySelector(".debit").innerText = `$${totalDebito.toFixed(2)}`;
    document.querySelector(".stat-movimientos .stat-value").innerText =
      transacciones.length;
    document.getElementById("id-qr").innerText = detalles.codigo_wallet;

    const imgQr = document.getElementById("img-qr");
    if (detalles.qr) {
      imgQr.src = detalles.qr;
      imgQr.alt = "Código QR Wallet";
    }
  } catch (error) {
    console.error("Error al cargar datos del modelo:", error);
  }
}

// Nueva función para configurar la lógica de mostrar la imagen
function configurarMostrarImagenPerfil() {
  const profileImage = document.getElementById("foto-perfill");
  const modalOverlay = document.createElement("div");
  const modalContent = document.createElement("img");
  const closeButton = document.createElement("span");

  modalOverlay.classList.add("modal-overlay");

  // **Aquí está el cambio clave:** asigna el src del modal cuando se crea,
  // pero lo actualizaremos cada vez que se abre para asegurar que sea la imagen más reciente.
  modalContent.classList.add("modal-content");
  modalContent.alt = profileImage.alt; // Mantener el alt

  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&times;";

  modalOverlay.appendChild(modalContent);
  modalOverlay.appendChild(closeButton);
  document.body.appendChild(modalOverlay);

  profileImage.addEventListener("click", () => {
    // **¡Importante!** Actualiza el `src` del modal justo antes de mostrarlo
    // para asegurarte de que siempre refleje la imagen actual cargada por `cargarDatosDelModelo`.
    modalContent.src = profileImage.src;
    modalOverlay.style.display = "flex";
  });

  closeButton.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });
}

async function cargarSweetAlert() {
  if (typeof Swal === "undefined") {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar SweetAlert2"));
      document.head.appendChild(script);
    });
  }
  return Promise.resolve();
}

function configurarModalEdicion() {
  document
    .getElementById("editarModeloModal")
    .addEventListener("show.bs.modal", function () {
      if (!modeloData) return;

      const detalles = modeloData.Detalles[0];
      document.getElementById("edit-ci").value = detalles.cedula || "";
      document.getElementById("edit-email").value = detalles.correo || "";
      document.getElementById("edit-phone").value = detalles.numero_tlf || "";
      document.getElementById("edit-edad").value = detalles.edad || "";
      document.getElementById("edit-tipo-cuenta").value =
        detalles.tipo_de_cuenta || "";
    });

  document
    .querySelector(".modal-footer .btn-primary")
    .addEventListener("click", async function () {
      if (!modeloData) return;

      const modeloId = new URLSearchParams(window.location.search).get("id");
      if (!modeloId) {
        alert("No se encontró el ID del modelo");
        return;
      }

      const updatedData = {
        cedula: document.getElementById("edit-ci").value.trim(),
        correo: document.getElementById("edit-email").value.trim(),
        numero_tlf: document.getElementById("edit-phone").value.trim(),
        edad: document.getElementById("edit-edad").value.trim(),
        tipo_de_cuenta: document.getElementById("edit-tipo-cuenta").value,
      };

      if (
        !updatedData.cedula ||
        !updatedData.correo ||
        !updatedData.numero_tlf ||
        !updatedData.edad
      ) {
        alert("Todos los campos son obligatorios");
        return;
      }

      try {
        const response = await fetch(
          `http://172.21.250.10:8000/modelos/api/head/${modeloId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Backend error:", error);
          throw new Error(error.message || "Error al actualizar");
        }

        const detalles = modeloData.Detalles[0];
        detalles.cedula = updatedData.cedula;
        detalles.correo = updatedData.correo;
        detalles.numero_tlf = updatedData.numero_tlf;
        detalles.edad = updatedData.edad;
        detalles.tipo_de_cuenta = updatedData.tipo_de_cuenta;

        document.getElementById("cedula-perfil").innerText = detalles.cedula;
        document.getElementById("perfil-email").innerText = detalles.correo;
        document.getElementById("perfil-telefono").innerText =
          detalles.numero_tlf;
        document.getElementById("perfil-edad").innerText = detalles.edad;

        if (detalles.qr) {
          document.getElementById("img-qr").src = detalles.qr;
        }

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editarModeloModal")
        );
        modal.hide();

        await cargarSweetAlert();
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Datos actualizados correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error:", error);
        alert(`Error al actualizar: ${error.message}`);
      }
    });
}

async function cargarTiposDeCuenta() {
  try {
    const response = await fetch(
      "http://172.21.250.10:8000/modelos/api/cuenta/"
    );
    const data = await response.json();

    const select = document.getElementById("edit-tipo-cuenta");
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
