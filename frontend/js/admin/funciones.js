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

// ==================== CARGAR SELECTS PRINCIPALES ====================
async function cargarCiudades() {
    try {
        const response = await fetch(API + 'ciudades/listar.php');
        const data = await manejarRespuesta(response, 'cargar ciudades');
        
        if (data.success && data.data.length > 0) {
            const select = document.getElementById('funcionIdCiudad');
            if (select) {
                select.innerHTML = '<option value="">-- Seleccionar ciudad --</option>' +
                    data.data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCinesPorCiudad(idCiudad) {
    try {
        const response = await fetch(API + `cines/listar-por-ciudad.php?idCiudad=${idCiudad}`);
        const data = await manejarRespuesta(response, 'cargar cines');
        
        const selectCine = document.getElementById('funcionIdCine');
        const selectSala = document.getElementById('funcionIdSala');
        
        if (data.success && data.data.length > 0) {
            selectCine.innerHTML = '<option value="">-- Seleccionar cineplanet --</option>' +
                data.data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            selectCine.disabled = false;
            selectSala.innerHTML = '<option value="">-- Selecciona cine primero --</option>';
            selectSala.disabled = true;
        } else {
            selectCine.innerHTML = '<option value="">No hay cines en esta ciudad</option>';
            selectCine.disabled = true;
            selectSala.innerHTML = '<option value="">-- Selecciona cine primero --</option>';
            selectSala.disabled = true;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('❌ Error al cargar cines', 'error');
    }
}

async function cargarSalasPorCine(idCine) {
    try {
        const response = await fetch(API + `salas/listar-por-cine.php?idCine=${idCine}`);
        const data = await manejarRespuesta(response, 'cargar salas');
        
        const selectSala = document.getElementById('funcionIdSala');
        
        if (data.success && data.data.length > 0) {
            selectSala.innerHTML = '<option value="">-- Seleccionar sala --</option>' +
                data.data.map(s => `<option value="${s.id}">${s.nombre} (Cap: ${s.capacidad})</option>`).join('');
            selectSala.disabled = false;
        } else {
            selectSala.innerHTML = '<option value="">No hay salas en este cine</option>';
            selectSala.disabled = true;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('❌ Error al cargar salas', 'error');
    }
}

async function cargarPeliculasSelect() {
    try {
        const response = await fetch(API + 'peliculas/listar.php');
        const data = await manejarRespuesta(response, 'cargar películas');
        
        if (data.success && data.data.length > 0) {
            const select = document.getElementById('funcionIdPelicula');
            if (select) {
                select.innerHTML = '<option value="">-- Seleccionar película --</option>' +
                    data.data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarFormatosSelect() {
    try {
        const response = await fetch(API + 'formatos/listar.php');
        const data = await manejarRespuesta(response, 'cargar formatos');
        
        if (data.success && data.data.length > 0) {
            const select = document.getElementById('funcionIdFormato');
            if (select) {
                select.innerHTML = '<option value="">-- Seleccionar formato --</option>' +
                    data.data.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarIdiomasSelect() {
    try {
        const response = await fetch(API + 'idiomas/listar.php');
        const data = await manejarRespuesta(response, 'cargar idiomas');
        
        if (data.success && data.data.length > 0) {
            const select = document.getElementById('funcionIdIdioma');
            if (select) {
                select.innerHTML = '<option value="">-- Seleccionar idioma --</option>' +
                    data.data.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== EVENTOS DE SELECTS EN CASCADA ====================
function inicializarEventosCascada() {
    const selectCiudad = document.getElementById('funcionIdCiudad');
    const selectCine = document.getElementById('funcionIdCine');
    
    if (selectCiudad) {
        selectCiudad.addEventListener('change', function() {
            if (this.value) {
                cargarCinesPorCiudad(this.value);
            }
        });
    }
    
    if (selectCine) {
        selectCine.addEventListener('change', function() {
            if (this.value) {
                cargarSalasPorCine(this.value);
            }
        });
    }
}

// ==================== CRUD FUNCIONES ====================
async function cargarFunciones() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'funciones/listar.php');
        const data = await manejarRespuesta(response, 'cargar funciones');
        
        if (data.success && data.data.length > 0) {
            const tbody = document.querySelector('#funcionesTable tbody');
            tbody.innerHTML = data.data.map(f => {
                const estadoBadge = {
                    'activa': 'badge-activa',
                    'inactiva': 'badge-inactiva',
                    'preventa': 'badge-preventa'
                };
                return `
                <tr>
                    <td><strong>${f.id}</strong></td>
                    <td>${f.nombrePelicula}</td>
                    <td>${f.nombreSala}</td>
                    <td>${f.nombreFormato}</td>
                    <td>${f.nombreIdioma}</td>
                    <td>${f.fecha}</td>
                    <td>${f.hora}</td>
                    <td>S/ ${parseFloat(f.precio).toFixed(2)}</td>
                    <td><span class="badge ${estadoBadge[f.estado] || 'badge-activa'}">${f.estado.toUpperCase()}</span></td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarFuncion(${f.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarFuncion(${f.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `}).join('');
            const emptyStateFunciones = document.getElementById('emptyStateFunciones');
            if (emptyStateFunciones) emptyStateFunciones.style.display = 'none';
        } else {
            document.querySelector('#funcionesTable tbody').innerHTML = '';
            const emptyStateFunciones = document.getElementById('emptyStateFunciones');
            if (emptyStateFunciones) emptyStateFunciones.style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function guardarFuncion() {
    const id = document.getElementById('funcionId').value;
    
    const datos = {
        idPelicula: parseInt(document.getElementById('funcionIdPelicula').value),
        idSala: parseInt(document.getElementById('funcionIdSala').value),
        idFormato: parseInt(document.getElementById('funcionIdFormato').value),
        idIdioma: parseInt(document.getElementById('funcionIdIdioma').value),
        fecha: document.getElementById('funcionFecha').value,
        hora: document.getElementById('funcionHora').value,
        precio: parseFloat(document.getElementById('funcionPrecio').value),
        estado: document.getElementById('funcionEstado').value
    };
    
    if (!datos.idPelicula || !datos.idSala || !datos.idFormato || !datos.idIdioma || !datos.fecha || !datos.hora || !datos.precio || !datos.estado) {
        mostrarAlerta('⚠️ Completa todos los campos requeridos', 'error');
        return;
    }
    
    const url = id ? API + `funciones/actualizar.php?id=${id}` : API + 'funciones/crear.php';
    const metodo = id ? 'PUT' : 'POST';
    
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await manejarRespuesta(response, 'guardar función');
        
        if (data.success) {
            mostrarAlerta(id ? '✅ Función actualizada' : '✅ Función creada', 'success');
            document.getElementById('funcionForm').reset();
            document.getElementById('funcionId').value = '';
            document.getElementById('funcionIdCine').disabled = true;
            document.getElementById('funcionIdSala').disabled = true;
            cargarFunciones();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function editarFuncion(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `funciones/obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar función');
        
        if (data.success) {
            const f = data.data;
            document.getElementById('funcionId').value = f.id;
            
            // Cargar ciudad
            const ciudadSelect = document.getElementById('funcionIdCiudad');
            if (ciudadSelect && f.idCiudad) {
                ciudadSelect.value = f.idCiudad;
                await cargarCinesPorCiudad(f.idCiudad);
                
                // Luego cargar cine
                const cineSelect = document.getElementById('funcionIdCine');
                if (cineSelect) {
                    cineSelect.value = f.idCine;
                    await cargarSalasPorCine(f.idCine);
                    
                    // Finalmente cargar sala
                    const salaSelect = document.getElementById('funcionIdSala');
                    if (salaSelect) {
                        salaSelect.value = f.idSala;
                    }
                }
            }
            
            document.getElementById('funcionIdPelicula').value = f.idPelicula;
            document.getElementById('funcionIdFormato').value = f.idFormato;
            document.getElementById('funcionIdIdioma').value = f.idIdioma;
            document.getElementById('funcionFecha').value = f.fecha;
            document.getElementById('funcionHora').value = f.hora;
            document.getElementById('funcionPrecio').value = f.precio;
            document.getElementById('funcionEstado').value = f.estado;
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function eliminarFuncion(id) {
    if (confirm('⚠️ ¿Eliminar esta función?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `funciones/eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar función');
            
            if (data.success) {
                mostrarAlerta('✅ Función eliminada', 'success');
                cargarFunciones();
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

// ==================== INICIALIZACIÓN ====================
export async function inicializarFunciones() {
    await cargarCiudades();
    await cargarPeliculasSelect();
    await cargarFormatosSelect();
    await cargarIdiomasSelect();
    inicializarEventosCascada();
}

// ==================== EXPORTAR ====================
export { cargarFunciones, guardarFuncion, editarFuncion, eliminarFuncion };
