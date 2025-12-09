import BASE_API_DOMAIN from '../config.js';

const API = BASE_API_DOMAIN + 'admin/';
let horariosDisponiblesCache = {};

// ==================== FUNCIONES DE UTILIDAD ====================
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

// ==================== CONVERTIR HORA A ZONA HORARIA DE PERÚ ====================
function convertirAHoraPeruana(horaSelect) {
    // horaSelect es un string en formato "HH:MM" del select
    const [horas, minutos] = horaSelect.split(':').map(Number);
    
    // Crear una fecha con la hora actual para obtener la zona horaria del cliente
    const ahora = new Date();
    const offsetLocal = ahora.getTimezoneOffset() * 60000; // en milisegundos
    
    // Zona horaria de Perú: UTC-5 (siempre, no tiene horario de verano)
    const offsetPeru = -5 * 60 * 60000; // UTC-5 en milisegundos
    
    // Crear una fecha con la hora ingresada
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    
    // Calcular la diferencia de zonas horarias
    const diferencia = (offsetLocal + offsetPeru) / 3600000; // en horas
    
    // Ajustar la hora
    fecha.setHours(fecha.getHours() + diferencia);
    
    // Retornar en formato HH:MM
    const horasAjustadas = String(fecha.getHours()).padStart(2, '0');
    const minutosAjustados = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${horasAjustadas}:${minutosAjustados}`;
}

// ==================== CONVERTIR FECHA Y HORA A ZONA HORARIA DE PERÚ ====================
function convertirAFechaHoraPeruana(fecha, hora) {
    // fecha: "YYYY-MM-DD", hora: "HH:MM"
    // Construye la fecha local
    const [year, month, day] = fecha.split('-').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);
    const fechaLocal = new Date(year, month - 1, day, horas, minutos, 0);

    // Convierte a la zona horaria de Perú usando toLocaleString
    const fechaPeruana = new Date(fechaLocal.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    // Formatea la fecha y hora en formato YYYY-MM-DD y HH:MM
    const yearP = fechaPeruana.getFullYear();
    const mesP = String(fechaPeruana.getMonth() + 1).padStart(2, '0');
    const diaP = String(fechaPeruana.getDate()).padStart(2, '0');
    const horasP = String(fechaPeruana.getHours()).padStart(2, '0');
    const minutosP = String(fechaPeruana.getMinutes()).padStart(2, '0');

    return {
        fecha: `${yearP}-${mesP}-${diaP}`,
        hora: `${horasP}:${minutosP}`
    };
}

// ==================== VALIDACIÓN DE DISPONIBILIDAD ====================
async function cargarDisponibilidad(idSala, idPelicula) {
    try {
        const response = await fetch(API + `funciones/disponibilidad.php?idSala=${idSala}&idPelicula=${idPelicula}`);
        const data = await manejarRespuesta(response, 'cargar disponibilidad');
        
        if (data.success) {
            horariosDisponiblesCache = data.horariosDisponibles;
            const selectFecha = document.getElementById('funcionFecha');
            const selectHora = document.getElementById('funcionHora');
            
            if (selectFecha) {
                selectFecha.innerHTML = '<option value="">-- Seleccionar fecha --</option>';
                Object.keys(data.horariosDisponibles).forEach(fecha => {
                    if (data.horariosDisponibles[fecha].length > 0) {
                        const option = document.createElement('option');
                        // Mostrar la fecha tal como la entrega el backend
                        option.value = fecha;
                        option.textContent = `${fecha} (${data.horariosDisponibles[fecha].length} horarios)`;
                        selectFecha.appendChild(option);
                    }
                });
                selectFecha.disabled = false;
            }
            
            // Limpiar horas
            if (selectHora) {
                selectHora.innerHTML = '<option value="">-- Selecciona fecha primero --</option>';
                selectHora.disabled = true;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('❌ Error al cargar disponibilidad', 'error');
    }
}

// ==================== EVENTOS DE SELECTS EN CASCADA ====================
function inicializarEventosCascada() {
    const selectCiudad = document.getElementById('funcionIdCiudad');
    const selectCine = document.getElementById('funcionIdCine');
    const selectSala = document.getElementById('funcionIdSala');
    const selectPelicula = document.getElementById('funcionIdPelicula');
    const selectFecha = document.getElementById('funcionFecha');
    
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
    
    if (selectSala) {
        selectSala.addEventListener('change', function() {
            if (this.value && selectPelicula.value) {
                cargarDisponibilidad(this.value, selectPelicula.value);
            } else if (this.value) {
                selectFecha.disabled = true;
                selectFecha.innerHTML = '<option value="">-- Selecciona película primero --</option>';
            }
        });
    }
    
    if (selectPelicula) {
        selectPelicula.addEventListener('change', function() {
            if (this.value && selectSala.value) {
                cargarDisponibilidad(selectSala.value, this.value);
            } else if (this.value) {
                selectFecha.disabled = true;
                selectFecha.innerHTML = '<option value="">-- Selecciona sala primero --</option>';
            }
        });
    }
    
    if (selectFecha) {
        selectFecha.addEventListener('change', function() {
            const selectHora = document.getElementById('funcionHora');
            if (this.value && horariosDisponiblesCache[this.value]) {
                selectHora.innerHTML = '<option value="">-- Seleccionar hora --</option>';
                horariosDisponiblesCache[this.value].forEach(hora => {
                    const option = document.createElement('option');
                    option.value = hora;
                    option.textContent = hora;
                    selectHora.appendChild(option);
                });
                selectHora.disabled = false;
            } else {
                selectHora.innerHTML = '<option value="">-- Selecciona fecha primero --</option>';
                selectHora.disabled = true;
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
                        <button class="btn-edit" onclick="window.editarFuncion(${f.id})">Editar</button>
                        <button class="btn-delete" onclick="window.eliminarFuncion(${f.id})">Eliminar</button>
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
    const fechaSeleccionada = document.getElementById('funcionFecha').value;
    const horaSeleccionada = document.getElementById('funcionHora').value;

    // NO USAR Date ni conversiones aquí
    const datos = {
        idPelicula: parseInt(document.getElementById('funcionIdPelicula').value),
        idSala: parseInt(document.getElementById('funcionIdSala').value),
        idFormato: parseInt(document.getElementById('funcionIdFormato').value),
        idIdioma: parseInt(document.getElementById('funcionIdIdioma').value),
        fecha: fechaSeleccionada, // Enviar tal cual
        hora: horaSeleccionada,   // Enviar tal cual
        precio: parseFloat(document.getElementById('funcionPrecio').value),
        estado: document.getElementById('funcionEstado').value
    };

    console.log('📦 Datos enviados a BD:', datos);

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
            document.getElementById('funcionFecha').disabled = true;
            document.getElementById('funcionHora').disabled = true;
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
