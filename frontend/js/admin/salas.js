import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/salas/';

function mostrarAlerta(mensaje, tipo) {
    const alert = tipo === 'success' ? document.getElementById('successAlert') : document.getElementById('errorAlert');
    alert.textContent = mensaje;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 4000);
}

function mostrarCarga(visible) {
    document.getElementById('loading').classList.toggle('show', visible);
}

async function manejarRespuesta(response, operacion = 'operación') {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const texto = await response.text();
        console.error(`Error en ${operacion}:`, texto);
        throw new Error(`El servidor no devolvió JSON válido`);
    }
    return await response.json();
}

export async function cargarSalas() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'listar.php');
        const data = await manejarRespuesta(response, 'cargar salas');
        const tbody = document.querySelector('#salasTable tbody');
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(s => `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.nombre}</td>
                    <td>${s.capacidad}</td>
                    <td>${s.tipo}</td>
                    <td>${s.cine_nombre || '-'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarSala(${s.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarSala(${s.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `).join('');
            document.getElementById('emptyStateSalas').style.display = 'none';
        } else {
            tbody.innerHTML = '';
            document.getElementById('emptyStateSalas').style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function guardarSala() {
    const id = document.getElementById('salaId').value;
    const datos = {
        nombre: document.getElementById('salaNombre').value.trim(),
        capacidad: parseInt(document.getElementById('salaCapacidad').value),
        tipo: document.getElementById('salaTipo').value,
        idCine: parseInt(document.getElementById('salaIdCine').value)
    };
    if (!datos.nombre || !datos.capacidad || !datos.tipo || !datos.idCine) {
        mostrarAlerta('⚠️ Completa todos los campos requeridos', 'error');
        return;
    }
    const url = id ? API + `actualizar.php?id=${id}` : API + 'crear.php';
    const metodo = id ? 'PUT' : 'POST';
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await manejarRespuesta(response, 'guardar sala');
        if (data.success) {
            mostrarAlerta(id ? '✅ Sala actualizada' : '✅ Sala creada', 'success');
            document.getElementById('salaForm').reset();
            document.getElementById('salaId').value = '';
            cargarSalas();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function editarSala(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar sala');
        if (data.success) {
            const s = data.data;
            document.getElementById('salaId').value = s.id;
            document.getElementById('salaNombre').value = s.nombre || '';
            document.getElementById('salaCapacidad').value = s.capacidad || '';
            document.getElementById('salaTipo').value = s.tipo || '';
            document.getElementById('salaIdCine').value = s.idCine || '';
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function eliminarSala(id) {
    if (confirm('⚠️ ¿Eliminar esta sala?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar sala');
            if (data.success) {
                mostrarAlerta('✅ Sala eliminada', 'success');
                cargarSalas();
            } else {
                mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
            }
        } catch (error) {
            mostrarAlerta('❌ ' + error.message, 'error');
        } finally {
            mostrarCarga(false);
        }
    }
}

export async function inicializarSalas() {
    // Cargar cines en el select
    try {
        const res = await fetch(BASE_API_DOMAIN + 'admin/cines/listar.php');
        const json = await res.json();
        const select = document.getElementById('salaIdCine');
        if (!select) return;
        select.innerHTML = '<option value="">-- Seleccionar cine --</option>';
        if (json.success && Array.isArray(json.data)) {
            json.data.forEach(cine => {
                const opt = document.createElement('option');
                opt.value = cine.id;
                opt.textContent = cine.nombre;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        // No mostrar alerta aquí, solo dejar el select vacío
    }
    // Reset form
    const form = document.getElementById('salaForm');
    if (form) {
        form.addEventListener('reset', () => {
            document.getElementById('salaId').value = '';
        });
    }
}
