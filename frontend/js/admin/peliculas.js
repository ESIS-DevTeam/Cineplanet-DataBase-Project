import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + '/admin/peliculas/';

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

async function cargarGeneros() {
    const select = document.getElementById('peliculaGenero');
    if (!select) return;
    select.innerHTML = '<option value="">-- Cargando géneros --</option>';
    try {
        const response = await fetch(BASE_API_DOMAIN + 'admin/generos/listar.php');
        const data = await manejarRespuesta(response, 'cargar géneros');
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">-- Seleccionar género --</option>' +
                data.data.map(g => `<option value="${g.id}">${g.nombre}</option>`).join('');
        }
    } catch (error) {
        select.innerHTML = '<option value="">Error al cargar géneros</option>';
    }
}

async function cargarRestricciones() {
    const select = document.getElementById('peliculaRestriccion');
    if (!select) return;
    select.innerHTML = '<option value="">-- Cargando restricciones --</option>';
    try {
        const response = await fetch(BASE_API_DOMAIN + 'admin/restricciones/listar.php');
        const data = await manejarRespuesta(response, 'cargar restricciones');
        if (data.success && data.data.length > 0) {
            select.innerHTML = '<option value="">-- Seleccionar restricción --</option>' +
                data.data.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');
        }
    } catch (error) {
        select.innerHTML = '<option value="">Error al cargar restricciones</option>';
    }
}

async function cargarPeliculas() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'listar.php');
        const data = await manejarRespuesta(response, 'cargar películas');
        const tbody = document.querySelector('#peliculasTable tbody');
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(p => `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>${p.nombre}</td>
                    <td>${p.genero_nombre || '-'}</td>
                    <td>${p.duracion} min</td>
                    <td>${p.restriccion_nombre || '-'}</td>
                    <td>${p.estado}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarPelicula(${p.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarPelicula(${p.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `).join('');
            document.getElementById('emptyStatePeliculas').style.display = 'none';
        } else {
            tbody.innerHTML = '';
            document.getElementById('emptyStatePeliculas').style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function guardarPelicula() {
    const id = document.getElementById('peliculaId').value;
    const form = document.getElementById('peliculaForm');
    const formData = new FormData();
    formData.append('nombre', document.getElementById('peliculaNombre').value.trim());
    formData.append('genero', document.getElementById('peliculaGenero').value);
    formData.append('duracion', parseInt(document.getElementById('peliculaDuracion').value));
    formData.append('restriccion', document.getElementById('peliculaRestriccion').value);
    formData.append('restriccionComercial', parseInt(document.getElementById('peliculaRestriccionComercial').value));
    formData.append('sinopsis', document.getElementById('peliculaSinopsis').value.trim());
    formData.append('autor', document.getElementById('peliculaAutor').value.trim());
    formData.append('trailer', document.getElementById('peliculaTrailer').value.trim());
    formData.append('estado', document.getElementById('peliculaEstado').value);
    const portadaInput = document.getElementById('peliculaPortada');
    if (portadaInput.files && portadaInput.files[0]) {
        formData.append('portada', portadaInput.files[0]);
    }
    if (!formData.get('nombre') || !formData.get('genero') || !formData.get('duracion') || !formData.get('restriccion')) {
        mostrarAlerta('⚠️ Completa los campos obligatorios', 'error');
        return;
    }
    const url = id ? API + `actualizar.php?id=${id}` : API + 'crear.php';
    const metodo = id ? 'POST' : 'POST'; // Para archivos, usar POST siempre
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            body: formData
        });
        const data = await manejarRespuesta(response, 'guardar película');
        if (data.success) {
            mostrarAlerta(id ? '✅ Película actualizada' : '✅ Película creada', 'success');
            document.getElementById('peliculaForm').reset();
            document.getElementById('peliculaId').value = '';
            cargarPeliculas();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function editarPelicula(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar película');
        if (data.success) {
            const p = data.data;
            document.getElementById('peliculaId').value = p.id;
            document.getElementById('peliculaNombre').value = p.nombre || '';
            document.getElementById('peliculaGenero').value = p.genero || '';
            document.getElementById('peliculaDuracion').value = p.duracion || '';
            document.getElementById('peliculaRestriccion').value = p.restriccion || '';
            document.getElementById('peliculaRestriccionComercial').value = p.restriccionComercial || 1;
            document.getElementById('peliculaSinopsis').value = p.sinopsis || '';
            document.getElementById('peliculaAutor').value = p.autor || '';
            document.getElementById('peliculaTrailer').value = p.trailer || '';
            // No se puede setear el value de un input type='file' por seguridad. Se omite esta línea.
            document.getElementById('peliculaEstado').value = p.estado || 'activa';
            // Mostrar nombre de imagen actual si existe
            if (p.portada) {
                const portadaNombre = document.getElementById('portadaNombre');
                if (portadaNombre) portadaNombre.textContent = `Imagen actual: ${p.portada}`;
            }
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function eliminarPelicula(id) {
    if (confirm('⚠️ ¿Eliminar esta película?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar película');
            if (data.success) {
                mostrarAlerta('✅ Película eliminada', 'success');
                cargarPeliculas();
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

export async function inicializarPeliculas() {
    await cargarGeneros();
    await cargarRestricciones();
    const form = document.getElementById('peliculaForm');
    if (form) {
        form.addEventListener('reset', () => {
            document.getElementById('peliculaId').value = '';
        });
    }
}

export { cargarPeliculas, guardarPelicula, editarPelicula, eliminarPelicula };
