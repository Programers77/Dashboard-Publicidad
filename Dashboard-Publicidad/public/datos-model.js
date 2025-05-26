let modeloData = null;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modeloId = urlParams.get("id");

  if (modeloId) {
    await cargarDatosDelModelo(modeloId);
    configurarModalEdicion();
  }
});

async function cargarDatosDelModelo(modeloId) {
  try {
    const response = await fetch(
      `http://10.100.39.23:8000/modelos/api/head/detallespersonales/?id=${modeloId}`
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
      imgPerfil.src = detalles.foto_perfil; // Asegúrate de que el backend devuelve una URL completa
      imgPerfil.alt = "Foto del modelo";
    } else {
      imgPerfil.src = "/descarga.png"; // imagen por defecto
    }

    if (detalles.pautas_asignadas && detalles.pautas_asignadas.nombres) {
      const tagscontainer = document.querySelector(".tags-container");

      tagscontainer.innerHTML = "";

      detalles.pautas_asignadas.nombres.forEach((pauta) => {
        console.log("Pautas asignadas:", detalles.pautas_asignadas.nombres);
        const pautaElement = document.createElement("span");
        pautaElement.classList.add("tag", "tag-gala"); // Agregar las clases necesarias

        // Crear un elemento para la pauta
        const icono = document.createElement("i");
        icono.classList.add("fas", "fa-star");
        pautaElement.appendChild(icono);

        // Agregar el texto de la pauta
        pautaElement.appendChild(document.createTextNode(pauta));

        // Crear el botón de eliminación
        const botonEliminar = document.createElement("button");
        botonEliminar.classList.add("tag-remove");

        // Crear el icono para el botón de eliminación
        const iconoEliminar = document.createElement("i");
        iconoEliminar.classList.add("fas", "fa-times");
        botonEliminar.appendChild(iconoEliminar);

        // Agregar el botón de eliminación al span de la pauta
        pautaElement.appendChild(botonEliminar);

        pautaElement.innerText = pauta;

        // Agregar el elemento al contenedor
        tagscontainer.appendChild(pautaElement);
      });
    } else {
      // Si no hay pautas asignadas, mostrar un mensaje predeterminado
      document.getElementById("tags-container").innerText =
        "No hay pautas asignadas";
    }

    console.log("Detalles del modelo:", detalles);
    // Mantener la funcionalidad del saldo y QR
    document.getElementById("saldo").innerText = `$${detalles.saldo}`;
    // Procesar transacciones
    const transacciones = detalles.transaciones;

    // Inicializar totales
    let totalCredito = 0;
    let totalDebito = 0;

    transacciones.forEach((tx) => {
      if (tx.tipo_de_movimiento === "CREDITO") {
        totalCredito += tx.monto;
      } else if (tx.tipo_de_movimiento === "DEBITO") {
        totalDebito += tx.monto;
      }
    });

    // Mostrar montos formateados en HTML
    document
      .getElementById("balance-ingresos")
      .querySelector(".credit").innerText = `$${totalCredito.toFixed(2)}`;
    document
      .getElementById("balance-gastos")
      .querySelector(".debit").innerText = `$${totalDebito.toFixed(2)}`;

    // Mostrar cantidad de movimientos
    document.querySelector(".stat-movimientos .stat-value").innerText =
      transacciones.length;

    document.getElementById("id-qr").innerText = detalles.codigo_wallet;

    // Actualizar la imagen QR si existe
    const imgQr = document.getElementById("img-qr");
    if (detalles.qr) {
      imgQr.src = detalles.qr;
      imgQr.alt = "Código QR Wallet";
    }
  } catch (error) {
    console.error("Error al cargar datos del modelo:", error);
  }
}

//funcionalidad qr


function configurarModalEdicion() {
  // Precargar datos en el modal
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

  // Configurar el botón de guardar
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
        correo: document.getElementById("edit-email").value,
        numero_tlf: document.getElementById("edit-phone").value,
        edad: document.getElementById("edit-edad").value,
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
          `http://10.100.39.23:8000/modelos/api/head/${modeloId}/`,
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

        // Actualización local
        const detalles = modeloData.Detalles[0];
        detalles.cedula = updatedData.cedula;
        detalles.correo = updatedData.correo;
        detalles.numero_tlf = updatedData.numero_tlf;
        detalles.edad = updatedData.edad;
        detalles.tipo_de_cuenta = updatedData.tipo_de_cuenta;
        console.log("Detalles actualizados:", detalles);

        // Reflejar cambios en la UI
        document.getElementById("cedula-perfil").innerText = detalles.cedula;
        document.getElementById("perfil-email").innerText = detalles.correo;
        document.getElementById("perfil-telefono").innerText =
          detalles.numero_tlf;
        document.getElementById("perfil-edad").innerText = detalles.edad;
        document.getElementById("edit-tipo-cuenta").value =
          detalles.tipo_de_cuenta;
        const imgQr = document.getElementById("img-qr");
        if (detalles.qr) {
          imgQr.src = detalles.qr;
        }

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editarModeloModal")
        );
        modal.hide();

        alert("Datos actualizados correctamente");
      } catch (error) {
        console.error("Error:", error);
        alert(`Error al actualizar: ${error.message}`);
      }
    });
}
async function cargarTiposDeCuenta() {
  try {
    const response = await fetch(
      "http://10.100.39.23:8000/modelos/api/cuenta/"
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
