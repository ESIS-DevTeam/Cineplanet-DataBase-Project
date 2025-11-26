import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/';

// ==================== FUNCIONES DE UTILIDAD ====================
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

// ==================== CRUD USUARIOS ====================
async function cargarUsuarios() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'usuarios/listar.php');
        const data = await manejarRespuesta(response, 'cargar usuarios');
        
        if (data.success && data.data.length > 0) {
            const tbody = document.querySelector('#usuariosTable tbody');
            tbody.innerHTML = data.data.map(u => `
                <tr>
                    <td><strong>${u.id}</strong></td>
                    <td>${u.nombre}</td>
                    <td>${u.email}</td>
                    <td>${u.tipoDocumento}: ${u.numeroDocumento}</td>
                    <td><span style="background: ${u.tipo === 'admin' ? '#ea4335' : '#1a73e8'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">${u.tipo.toUpperCase()}</span></td>
                    <td>${u.estado_cliente}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarUsuario(${u.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarUsuario(${u.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `).join('');
            const emptyStateUsuarios = document.getElementById('emptyStateUsuarios');
            if (emptyStateUsuarios) emptyStateUsuarios.style.display = 'none';
        } else {
            document.querySelector('#usuariosTable tbody').innerHTML = '';
            const emptyStateUsuarios = document.getElementById('emptyStateUsuarios');
            if (emptyStateUsuarios) emptyStateUsuarios.style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function guardarUsuario() {
    const id = document.getElementById('usuarioId').value;
    const datos = {
        nombre: document.getElementById('usuarioNombre').value.trim(),
        email: document.getElementById('usuarioEmail').value.trim(),
        tipoDocumento: document.getElementById('usuarioTipoDoc').value,
        numeroDocumento: document.getElementById('usuarioNumDoc').value.trim(),
        tipo: document.getElementById('usuarioTipo').value
    };
    
    if (!datos.nombre || !datos.email || !datos.tipoDocumento || !datos.numeroDocumento || !datos.tipo) {
        mostrarAlerta('⚠️ Completa todos los campos', 'error');
        return;
    }
    
    const url = id ? API + `usuarios/actualizar.php?id=${id}` : API + 'usuarios/crear.php';
    const metodo = id ? 'PUT' : 'POST';
    
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await manejarRespuesta(response, 'guardar usuario');
        
        if (data.success) {
            mostrarAlerta(id ? '✅ Usuario actualizado' : '✅ Usuario creado', 'success');
            document.getElementById('usuarioForm').reset();
            document.getElementById('usuarioId').value = '';
            cargarUsuarios();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function editarUsuario(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `usuarios/obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar usuario');
        
        if (data.success) {
            const u = data.data;
            document.getElementById('usuarioId').value = u.id;
            document.getElementById('usuarioNombre').value = u.nombre;
            document.getElementById('usuarioEmail').value = u.email;
            document.getElementById('usuarioTipoDoc').value = u.tipoDocumento;
            document.getElementById('usuarioNumDoc').value = u.numeroDocumento;
            document.getElementById('usuarioTipo').value = u.tipo;
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function eliminarUsuario(id) {
    if (confirm('⚠️ ¿Eliminar este usuario?\n\nEsto también eliminará todos sus datos asociados (socios, boletas, etc.)')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `usuarios/eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar usuario');
            
            if (data.success) {
                mostrarAlerta('✅ Usuario eliminado', 'success');
                cargarUsuarios();
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

// ==================== EXPORTAR ====================
export { cargarUsuarios, guardarUsuario, editarUsuario, eliminarUsuario };
