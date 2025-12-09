import BASE_API_DOMAIN from '../config.js';

const endpoints = {
    generos: 'admin/generos/',
    idiomas: 'admin/idiomas/',
    formatos: 'admin/formatos/',
    restricciones: 'admin/restricciones/',
    ciudades: 'admin/ciudades/'
};

let catalogoActual = 'generos';

function getAPI() {
    return BASE_API_DOMAIN + endpoints[catalogoActual];
}

function mostrarAlerta(mensaje, tipo) {
    const alert = tipo === 'success' ? document.getElementById('successAlert') : document.getElementById('errorAlert');
    alert.textContent = mensaje;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 4000);
}

function mostrarCarga(visible) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = visible ? 'flex' : 'none';
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

export function setCatalogo(tipo) {
    catalogoActual = tipo;
    // Cambia el título y placeholder
    const titulos = {
        generos: 'Géneros',
        idiomas: 'Idiomas',
        formatos: 'Formatos',
        restricciones: 'Restricciones',
        ciudades: 'Ciudades'
    };
    document.getElementById('catalogoTitulo').textContent = titulos[tipo];
    document.getElementById('catalogoLabelNombre').textContent = 'Nombre *';
    document.getElementById('catalogoNombre').placeholder = 'Nombre';
    cargarCatalogo();
}

export async function cargarCatalogo() {
    mostrarCarga(true);
    try {
        const response = await fetch(getAPI() + 'listar.php');
        const data = await manejarRespuesta(response, 'cargar catálogo');
        // Usar un solo contenedor para la tabla
        const container = document.getElementById('tablaCatalogoContainer');
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="catalogo-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(e => `
                            <tr>
                                <td>${e.id}</td>
                                <td>${e.nombre}</td>
                                <td>
                                    <button class="btn-edit" onclick="window.editarCatalogo(${e.id})">🖉 Editar</button>
                                    <button class="btn-delete" onclick="window.eliminarCatalogo(${e.id})">🗑 Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="empty-state"><p>📭 No hay registros</p></div>';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function guardarCatalogo() {
    const id = document.getElementById('catalogoId').value;
    const nombre = document.getElementById('catalogoNombre').value.trim();
    if (!nombre) {
        mostrarAlerta('⚠️ Completa el nombre', 'error');
        return;
    }
    const datos = { nombre };
    const url = id ? getAPI() + `actualizar.php?id=${id}` : getAPI() + 'crear.php';
    const metodo = id ? 'PUT' : 'POST';
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await manejarRespuesta(response, 'guardar');
        if (data.success) {
            mostrarAlerta(id ? '✅ Actualizado' : '✅ Creado', 'success');
            document.getElementById('catalogoForm').reset();
            document.getElementById('catalogoId').value = '';
            cargarCatalogo();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function editarCatalogo(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(getAPI() + `obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'obtener');
        if (data.success) {
            document.getElementById('catalogoId').value = data.data.id;
            document.getElementById('catalogoNombre').value = data.data.nombre;
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function eliminarCatalogo(id) {
    if (confirm('¿Eliminar este registro?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(getAPI() + `eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar');
            if (data.success) {
                mostrarAlerta('✅ Eliminado', 'success');
                cargarCatalogo();
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

export function inicializarCatalogo() {
    const form = document.getElementById('catalogoForm');
    if (form) {
        form.addEventListener('reset', () => {
            document.getElementById('catalogoId').value = '';
        });
    }
}
window.guardarCatalogo = guardarCatalogo;
window.editarCatalogo = editarCatalogo;
window.eliminarCatalogo = eliminarCatalogo;
