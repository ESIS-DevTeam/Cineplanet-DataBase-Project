import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/';

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

async function cargarProductos() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'productos/listar.php');
        const data = await manejarRespuesta(response, 'cargar productos');
        if (data.success && data.data.length > 0) {
            const tbody = document.querySelector('#productosTable tbody');
            tbody.innerHTML = data.data.map(p => `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>${p.nombre}</td>
                    <td>${p.descripcion || '-'}</td>
                    <td>S/ ${parseFloat(p.precio).toFixed(2)}</td>
                    <td>${p.tipo}</td>
                    <td>${p.estado}</td>
                    <td>${p.requiereSocio == 1 ? '✅' : '❌'}</td>
                    <td>${p.gradoMinimo || '-'}</td>
                    <td>${p.requiereEmpleado == 1 ? '✅' : '❌'}</td>
                    <td>${p.canjeaPuntos == 1 ? '✅' : '❌'}</td>
                    <td>${p.puntosNecesarios || '-'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarProducto(${p.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarProducto(${p.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `).join('');
            const emptyState = document.getElementById('emptyStateProductos');
            if (emptyState) emptyState.style.display = 'none';
        } else {
            document.querySelector('#productosTable tbody').innerHTML = '';
            const emptyState = document.getElementById('emptyStateProductos');
            if (emptyState) emptyState.style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function guardarProducto() {
    const id = document.getElementById('productoId').value;
    const formData = new FormData();
    formData.append('nombre', document.getElementById('productoNombre').value.trim());
    formData.append('descripcion', document.getElementById('productoDescripcion').value.trim());
    formData.append('precio', parseFloat(document.getElementById('productoPrecio').value));
    formData.append('tipo', document.getElementById('productoTipo').value);
    formData.append('estado', document.getElementById('productoEstado').value);
    formData.append('requiereSocio', parseInt(document.getElementById('productoRequiereSocio').value));
    formData.append('gradoMinimo', document.getElementById('productoGradoMinimo').value || null);
    formData.append('requiereEmpleado', parseInt(document.getElementById('productoRequiereEmpleado').value));
    formData.append('canjeaPuntos', parseInt(document.getElementById('productoCanjeaPuntos').value));
    formData.append('puntosNecesarios', document.getElementById('productoPuntosNecesarios').value ? parseInt(document.getElementById('productoPuntosNecesarios').value) : null);

    // Imagen
    const imagenInput = document.getElementById('productoImagen');
    if (imagenInput.files && imagenInput.files[0]) {
        formData.append('imagen', imagenInput.files[0]);
    }

    if (!formData.get('nombre') || !formData.get('precio') || !formData.get('tipo') || !formData.get('estado')) {
        mostrarAlerta('⚠️ Completa los campos requeridos', 'error');
        return;
    }

    const url = id ? API + `productos/actualizar.php?id=${id}` : API + 'productos/crear.php';
    const metodo = 'POST'; // Para archivos, usar POST siempre

    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            body: formData
        });
        const data = await manejarRespuesta(response, 'guardar producto');
        if (data.success) {
            mostrarAlerta(id ? '✅ Producto actualizado' : '✅ Producto creado', 'success');
            document.getElementById('productoForm').reset();
            document.getElementById('productoId').value = '';
            const imagenNombreDiv = document.getElementById('productoImagenNombre');
            if (imagenNombreDiv) imagenNombreDiv.textContent = '';
            cargarProductos();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function editarProducto(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `productos/obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar producto');
        if (data.success) {
            const p = data.data;
            document.getElementById('productoId').value = p.id;
            document.getElementById('productoNombre').value = p.nombre || '';
            document.getElementById('productoDescripcion').value = p.descripcion || '';
            document.getElementById('productoPrecio').value = p.precio || '';
            document.getElementById('productoTipo').value = p.tipo || '';
            document.getElementById('productoEstado').value = p.estado || '';
            document.getElementById('productoRequiereSocio').value = p.requiereSocio || 0;
            document.getElementById('productoGradoMinimo').value = p.gradoMinimo || '';
            document.getElementById('productoRequiereEmpleado').value = p.requiereEmpleado || 0;
            document.getElementById('productoCanjeaPuntos').value = p.canjeaPuntos || 0;
            document.getElementById('productoPuntosNecesarios').value = p.puntosNecesarios || '';
            // Mostrar nombre de imagen actual si existe
            if (p.imagen) {
                const imagenNombre = document.getElementById('productoImagenNombre');
                if (imagenNombre) imagenNombre.textContent = `Imagen actual: ${p.imagen}`;
            }
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function eliminarProducto(id) {
    if (confirm('⚠️ ¿Eliminar este producto?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `productos/eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar producto');
            if (data.success) {
                mostrarAlerta('✅ Producto eliminado', 'success');
                cargarProductos();
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

export { cargarProductos, guardarProducto, editarProducto, eliminarProducto };
