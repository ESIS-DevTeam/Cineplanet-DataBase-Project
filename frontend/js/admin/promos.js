import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/promos/';

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

export async function cargarPromos() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'listar.php');
        const data = await manejarRespuesta(response, 'cargar promociones');
        const tbody = document.querySelector('#promosTable tbody');
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(p => `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td>${p.nombre}</td>
                    <td>${p.tipo}</td>
                    <td>${p.valor}</td>
                    <td>${p.estado}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarPromo(${p.id})">Editar</button>
                        <button class="btn-delete" onclick="window.eliminarPromo(${p.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('');
            document.getElementById('emptyStatePromos').style.display = 'none';
        } else {
            tbody.innerHTML = '';
            document.getElementById('emptyStatePromos').style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function guardarPromo() {
    const id = document.getElementById('promoId').value;
    const datos = {
        nombre: document.getElementById('promoNombre').value.trim(),
        descripcion: document.getElementById('promoDescripcion').value.trim(),
        fecha_inicio: document.getElementById('promoFechaInicio').value,
        fecha_fin: document.getElementById('promoFechaFin').value,
        tipo: document.getElementById('promoTipo').value,
        valor: parseFloat(document.getElementById('promoValor').value),
        aplicaA: document.getElementById('promoAplicaA').value,
        requiereSocio: document.getElementById('promoRequiereSocio').value,
        gradoMinimo: document.getElementById('promoGradoMinimo').value,
        requiereEmpleado: document.getElementById('promoRequiereEmpleado').value,
        combinable: document.getElementById('promoCombinable').value,
        requierePuntos: document.getElementById('promoRequierePuntos').value,
        puntosNecesarios: document.getElementById('promoPuntosNecesarios').value,
        tieneStock: document.getElementById('promoTieneStock').value,
        stock: document.getElementById('promoStock').value,
        aplicaRestriccion: document.getElementById('promoAplicaRestriccion').value,
        estado: document.getElementById('promoEstado').value
    };
    if (!datos.nombre || !datos.tipo || isNaN(datos.valor)) {
        mostrarAlerta('⚠️ Completa los campos obligatorios', 'error');
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
        const data = await manejarRespuesta(response, 'guardar promoción');
        if (data.success) {
            mostrarAlerta(id ? '✅ Promoción actualizada' : '✅ Promoción creada', 'success');
            document.getElementById('promoForm').reset();
            document.getElementById('promoId').value = '';
            cargarPromos();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function editarPromo(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar promoción');
        if (data.success) {
            const p = data.data;
            document.getElementById('promoId').value = p.id;
            document.getElementById('promoNombre').value = p.nombre || '';
            document.getElementById('promoDescripcion').value = p.descripcion || '';
            document.getElementById('promoFechaInicio').value = p.fecha_inicio || '';
            document.getElementById('promoFechaFin').value = p.fecha_fin || '';
            document.getElementById('promoTipo').value = p.tipo || '';
            document.getElementById('promoValor').value = p.valor || '';
            document.getElementById('promoAplicaA').value = p.aplicaA || 'todo';
            document.getElementById('promoRequiereSocio').value = p.requiereSocio || '0';
            document.getElementById('promoGradoMinimo').value = p.gradoMinimo || '';
            document.getElementById('promoRequiereEmpleado').value = p.requiereEmpleado || '0';
            document.getElementById('promoCombinable').value = p.combinable || '1';
            document.getElementById('promoRequierePuntos').value = p.requierePuntos || '0';
            document.getElementById('promoPuntosNecesarios').value = p.puntosNecesarios || '';
            document.getElementById('promoTieneStock').value = p.tieneStock || '0';
            document.getElementById('promoStock').value = p.stock || '';
            document.getElementById('promoAplicaRestriccion').value = p.aplicaRestriccion || '';
            document.getElementById('promoEstado').value = p.estado || 'activa';
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

export async function eliminarPromo(id) {
    if (confirm('⚠️ ¿Eliminar esta promoción?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar promoción');
            if (data.success) {
                mostrarAlerta('✅ Promoción eliminada', 'success');
                cargarPromos();
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

export async function inicializarPromos() {
    // Reset form
    const form = document.getElementById('promoForm');
    if (form) {
        form.addEventListener('reset', () => {
            document.getElementById('promoId').value = '';
        });
    }
}
