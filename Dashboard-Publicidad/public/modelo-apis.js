document.addEventListener('DOMContentLoaded', async () => {
    const totalModelosEl = document.querySelector('.summary-cards .card:nth-child(1) .card-value');
    const tallasComunesEl = document.querySelector('.summary-cards .card:nth-child(2) .card-value');
    const rangoZapatosEl = document.querySelector('.summary-cards .card:nth-child(3) .card-value');
    const pautaComunEl = document.querySelector('.summary-cards .card:nth-child(4) .card-value');

    const tablaBody = document.querySelector('#tablaModelos');
    const tablaLoader = document.getElementById('tabla-loader');

    tablaLoader.style.display = 'block'; // Mostrar loader
    tablaBody.innerHTML = ''; // Limpiar tabla por si acaso

    
    try {
        const res = await fetch('http://10.100.39.23:8000/modelos/api/head/modelos');
        const data = await res.json();

        // Resumen
        console.log("Resumen de datos:", data);
        
        totalModelosEl.textContent = data.total_modelos;
        tallasComunesEl.textContent = data.talla_mas_comun.camisa;

        const zapatos = data.lista_de_modelos.map(m => parseInt(m.zapatos)).filter(n => !isNaN(n));
        const minZapato = Math.min(...zapatos);
        const maxZapato = Math.max(...zapatos);
        rangoZapatosEl.textContent = `${minZapato} - ${maxZapato}`;
        pautaComunEl.textContent = "Gala y Formal";

        // Agrupar por modelo
        const modelosAgrupados = {};
        data.lista_de_modelos.forEach((m) => {
            const id = m.modelo_id__id;

            if (!modelosAgrupados[id]) {
                modelosAgrupados[id] = {
                    nombre: m.modelo_id__nombres,
                    apellido: m.modelo_id__apellidos,
                    camisas: new Set(),
                    pantalones: new Set(),
                    zapatos: new Set(),
                    outfits: 0,
                };
            }

            modelosAgrupados[id].camisas.add(m.camisa);
            modelosAgrupados[id].pantalones.add(m.pantalon);
            modelosAgrupados[id].zapatos.add(m.zapatos);
            modelosAgrupados[id].outfits += 1;
        });

        // Insertar filas
        let index = 1;
        for (const modeloId in modelosAgrupados) {
            const m = modelosAgrupados[modeloId];
            const fila = document.createElement('tr');
            fila.setAttribute('data-model-id', modeloId);
            fila.classList.add('tabla-info')// 👈 AQUI ESTA LA CLAVE

            fila.innerHTML = `
                <td>${index++}</td>
                <td>${m.nombre} ${m.apellido}</td>
                <td>${[...m.camisas].join(', ')}</td>
                <td>${[...m.pantalones].join(', ')}</td>
                <td>-</td>
                <td>${[...m.zapatos].join(', ')}</td>
                <td>${m.outfits}</td>
            `;

            tablaBody.appendChild(fila);
            
        }

    } catch (error) {
        console.error('Error al cargar datos:', error);
        tablaBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error al cargar los datos.</td></tr>`;
    } finally {
        tablaLoader.style.display = 'none'; // Ocultar loader
    }

});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.table-wrapper').addEventListener('click', function (e) {
        // e.preventDefault()
        const modelRow = e.target.closest('tr');
        if (!modelRow) return;

        const modelId = modelRow.getAttribute('data-model-id');

        if (modelId) {
            e.preventDefault();
            window.location.href = `vista_personal?id=${modelId}`;
            console.log('ID del modelo:', id);
            
        }
    });
});

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}
