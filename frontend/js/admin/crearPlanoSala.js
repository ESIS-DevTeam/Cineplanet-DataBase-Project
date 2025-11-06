let cinesGlobal = [];
let ciudadesGlobal = [];
let salaSeleccionadaId = null;
let tipoAsientoSeleccionado = '';

async function cargarCiudadesYCines() {
    try {
        const [resCiudades, resCines] = await Promise.all([
            fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getCiudades.php'),
            fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/getCines.php')
        ]);
        ciudadesGlobal = await resCiudades.json();
        cinesGlobal = await resCines.json();

        const container = document.getElementById('lista-ciudades');
        container.innerHTML = '';

        ciudadesGlobal.forEach(ciudad => {
            const cinesEnCiudad = cinesGlobal.filter(c => c.idCiudad == ciudad.id);
            if (cinesEnCiudad.length > 0) {
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = ciudad.nombre;
                details.appendChild(summary);

                const ul = document.createElement('ul');
                cinesEnCiudad.forEach(cine => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = cine.nombre;
                    a.dataset.idCine = cine.id;
                    a.onclick = (e) => {
                        e.preventDefault();
                        cargarSalas(cine.id);
                    };
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                details.appendChild(ul);
                container.appendChild(details);
            }
        });
    } catch (error) {
        document.getElementById('lista-ciudades').textContent = 'Error al cargar.';
        console.error(error);
    }
}

async function cargarSalas(idCine) {
    const container = document.getElementById('lista-salas');
    container.innerHTML = 'Cargando salas...';
    try {
        const res = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getSalasPorCine.php?idCine=${idCine}`);
        const salas = await res.json();
        
        if (salas.length > 0) {
            const ul = document.createElement('ul');
            salas.forEach(sala => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = `${sala.nombre} (Tipo: ${sala.tipo})`;
                a.onclick = async (e) => {
                    e.preventDefault();
                    salaSeleccionadaId = sala.id;
                    document.getElementById('plano-container').style.display = 'block';
                    document.getElementById('grilla-asientos').innerHTML = '';
                    document.getElementById('guardar-plano').style.display = 'none';
                    // Consultar si ya existe plano para la sala
                    await cargarPlanoSalaExistente(sala.id);
                };
                li.appendChild(a);
                ul.appendChild(li);
            });
            container.innerHTML = '';
            container.appendChild(ul);
        } else {
            container.textContent = 'Este cine no tiene salas registradas.';
        }
    } catch (error) {
        container.textContent = 'Error al cargar las salas.';
        console.error(error);
    }
}

async function cargarPlanoSalaExistente(idSala) {
    try {
        const res = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getPlanoSalaPorSala.php?idSala=${idSala}`);
        const asientos = await res.json();
        if (Array.isArray(asientos) && asientos.length > 0) {
            // Detectar filas y columnas
            const filasSet = new Set(asientos.map(a => a.fila));
            const columnasSet = new Set(asientos.map(a => a.numero));
            const filas = filasSet.size;
            const columnas = columnasSet.size;
            // Asignar valores a los inputs
            document.getElementById('filas').value = filas;
            document.getElementById('columnas').value = columnas;
            generarGrilla(filas, columnas, asientos);
        }
    } catch (error) {
        // Si no hay plano, no hacer nada (se genera uno nuevo)
        document.getElementById('filas').value = '';
        document.getElementById('columnas').value = '';
    }
}

document.querySelectorAll('input[name="tipo-asiento"]').forEach(radio => {
    radio.addEventListener('change', function() {
        tipoAsientoSeleccionado = this.value;
    });
});

function generarGrilla(filas, columnas, asientosExistentes = null) {
    const grillaContainer = document.getElementById('grilla-asientos');
    grillaContainer.innerHTML = '';
    const letrasFilas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < filas; i++) {
        const filaDiv = document.createElement('div');
        const filaLetra = document.createElement('span');
        filaLetra.className = 'fila-letra';
        filaLetra.textContent = letrasFilas[i];
        filaDiv.appendChild(filaLetra);

        for (let j = 1; j <= columnas; j++) {
            const asiento = document.createElement('div');
            asiento.className = 'asiento tipo-normal';
            asiento.textContent = j;
            asiento.dataset.fila = letrasFilas[i];
            asiento.dataset.numero = j;
            asiento.dataset.tipo = 'normal';

            // Si existe plano, cargar tipo y color
            if (asientosExistentes) {
                const existente = asientosExistentes.find(a => a.fila === letrasFilas[i] && a.numero == j);
                if (existente) {
                    asiento.dataset.tipo = existente.tipo;
                    asiento.className = 'asiento tipo-' + existente.tipo;
                }
            }

            // Click izquierdo: asigna el tipo seleccionado, si no, vuelve a normal
            asiento.addEventListener('click', () => {
                if (tipoAsientoSeleccionado === 'discapacidad' || tipoAsientoSeleccionado === 'pasillo') {
                    asiento.dataset.tipo = tipoAsientoSeleccionado; // esto será 'pasillo' exactamente
                    asiento.className = 'asiento tipo-' + tipoAsientoSeleccionado;
                } else {
                    asiento.dataset.tipo = 'normal';
                    asiento.className = 'asiento tipo-normal';
                }
            });

            filaDiv.appendChild(asiento);
        }
        grillaContainer.appendChild(filaDiv);
    }
    document.getElementById('guardar-plano').style.display = 'block';
}

document.getElementById('form-definir-plano').addEventListener('submit', function(e) {
    e.preventDefault();
    const filas = parseInt(document.getElementById('filas').value);
    const columnas = parseInt(document.getElementById('columnas').value);
    generarGrilla(filas, columnas);
});

function mostrarBloqueo(mensaje = "Guardando plano...") {
    const overlay = document.getElementById('overlay-bloqueo');
    document.getElementById('overlay-mensaje').textContent = mensaje;
    overlay.style.display = 'flex';
}
function ocultarBloqueo() {
    document.getElementById('overlay-bloqueo').style.display = 'none';
}

document.getElementById('guardar-plano').addEventListener('click', async function() {
    if (!salaSeleccionadaId) {
        alert('Por favor, selecciona una sala primero.');
        return;
    }
    const asientos = document.querySelectorAll('#grilla-asientos .asiento');
    const plano = Array.from(asientos).map(asiento => ({
        idSala: salaSeleccionadaId,
        fila: asiento.dataset.fila,
        numero: parseInt(asiento.dataset.numero),
        tipo: asiento.dataset.tipo
    }));

    mostrarBloqueo();

    try {
        const response = await fetch('http://localhost/Cineplanet-DataBase-Project/backend/api/guardarPlanoSala.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plano)
        });
        const result = await response.json();
        if (response.ok) {
            mostrarBloqueo("Plano de sala guardado/modificado con éxito.");
            setTimeout(() => {
                ocultarBloqueo();
            }, 1500);
        } else {
            ocultarBloqueo();
            throw new Error(result.error || 'Error al guardar el plano.');
        }
    } catch (error) {
        ocultarBloqueo();
        console.error('Error al guardar:', error);
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarCiudadesYCines();
});
