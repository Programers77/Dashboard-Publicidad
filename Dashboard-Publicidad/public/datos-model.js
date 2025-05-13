
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeloId = urlParams.get('id');
    


     cargarDatosDelModelo(modeloId);
})

async function cargarDatosDelModelo(modeloId) {
    
    try {
        const response = await fetch(`http://10.100.39.23:8000/modelos/api/head/detallespersonales/?id=${modeloId}`);
        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const modelo = await response.json();

        console.log("Datos del modelo:", modelo);
        
        document.getElementById("nombre-perfil").innerText = modelo.Detalles[0].nombre;
        document.getElementById("id-perfil").innerText = modelo.Detalles[0].id;
        document.getElementById("cedula-perfil").innerText = modelo.Detalles[0].cedula;
        document.getElementById("perfil-email").innerText = modelo.Detalles[0].correo;
        document.getElementById("perfil-telefono").innerText = modelo.Detalles[0].telefono;
        document.getElementById("perfil-edad").innerText = modelo.Detalles[0].edad;

        
        

    } catch (error) {
        console.error("Error al cargar datos del modelo:", error);
    }
}
