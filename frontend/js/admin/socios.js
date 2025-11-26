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

// ==================== CRUD SOCIOS ====================
async function cargarUsuariosSelect() {
    try {
        const response = await fetch(API + 'usuarios/listar.php');
        const data = await manejarRespuesta(response, 'cargar usuarios');
        
        if (data.success && data.data.length > 0) {
            // Filtrar solo usuarios que NO tienen socio
            const usuariosSinSocio = data.data.filter(u => u.estado_cliente !== 'Socio');
            const select = document.getElementById('socioIdUsuario');
            select.innerHTML = '<option value="">-- Seleccionar usuario --</option>' +
                usuariosSinSocio.map(u => `<option value="${u.id}">${u.nombre} (${u.email})</option>`).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarSocios() {
    mostrarCarga(true);
    try {
        const response = await fetch(API + 'socios/listar.php');
        const data = await manejarRespuesta(response, 'cargar socios');
        
        if (data.success && data.data.length > 0) {
            const tbody = document.querySelector('#sociosTable tbody');
            tbody.innerHTML = data.data.map(s => {
                const gradoBadge = {
                    'clasico': 'badge-clasico',
                    'plata': 'badge-plata',
                    'oro': 'badge-oro',
                    'black': 'badge-black'
                };
                return `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.nombre}</td>
                    <td>${s.email}</td>
                    <td><span class="badge ${gradoBadge[s.grado] || 'badge-clasico'}">${s.grado.toUpperCase()}</span></td>
                    <td><strong>${s.puntos}</strong></td>
                    <td>${s.celular || '-'}</td>
                    <td>${s.empleado === 1 || s.empleado === '1' ? '✅' : '❌'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="window.editarSocio(${s.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="window.eliminarSocio(${s.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `}).join('');
            const emptyStateSocios = document.getElementById('emptyStateSocios');
            if (emptyStateSocios) emptyStateSocios.style.display = 'none';
        } else {
            document.querySelector('#sociosTable tbody').innerHTML = '';
            const emptyStateSocios = document.getElementById('emptyStateSocios');
            if (emptyStateSocios) emptyStateSocios.style.display = 'block';
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function guardarSocio() {
    const id = document.getElementById('socioId').value;
    const idUsuario = document.getElementById('socioIdUsuario').value;
    
    const datos = {
        idUsuario: parseInt(idUsuario),
        password: document.getElementById('socioPassword').value || null,
        apellidoPaterno: document.getElementById('socioApellidoPaterno').value.trim(),
        apellidoMaterno: document.getElementById('socioApellidoMaterno').value.trim(),
        grado: document.getElementById('socioGrado').value,
        genero: document.getElementById('socioGenero').value || null,
        fechaNacimiento: document.getElementById('socioFechaNacimiento').value || null,
        celular: document.getElementById('socioCelular').value.trim() || null,
        departamento: document.getElementById('socioDepartamento').value.trim() || null,
        provincia: document.getElementById('socioProvincia').value.trim() || null,
        distrito: document.getElementById('socioDistrito').value.trim() || null,
        cineplanetFavorito: document.getElementById('socioCineplanetFavorito').value.trim() || null,
        puntos: parseInt(document.getElementById('socioPuntos').value) || 0,
        empleado: parseInt(document.getElementById('socioEmpleado').value)
    };
    
    if (!id && !idUsuario) {
        mostrarAlerta('⚠️ Selecciona un usuario', 'error');
        return;
    }
    
    if (!datos.apellidoPaterno || !datos.apellidoMaterno || !datos.grado) {
        mostrarAlerta('⚠️ Completa los campos requeridos', 'error');
        return;
    }
    
    if (!id && !document.getElementById('socioPassword').value) {
        mostrarAlerta('⚠️ Ingresa contraseña para nuevo socio', 'error');
        return;
    }
    
    const url = id ? API + `socios/actualizar.php?id=${id}` : API + 'socios/crear.php';
    const metodo = id ? 'PUT' : 'POST';
    
    mostrarCarga(true);
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await manejarRespuesta(response, 'guardar socio');
        
        if (data.success) {
            mostrarAlerta(id ? '✅ Socio actualizado' : '✅ Socio creado', 'success');
            document.getElementById('socioForm').reset();
            document.getElementById('socioId').value = '';
            document.getElementById('socioPassword').required = true;
            cargarSocios();
            cargarUsuariosSelect();
            afterGuardarSocio();
        } else {
            mostrarAlerta('❌ ' + (data.message || 'Error'), 'error');
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

async function editarSocio(id) {
    mostrarCarga(true);
    try {
        const response = await fetch(API + `socios/obtener.php?id=${id}`);
        const data = await manejarRespuesta(response, 'cargar socio');
        
        if (data.success) {
            const s = data.data;
            document.getElementById('socioId').value = s.id;
            // Mostrar solo el usuario actual en el select y deshabilitarlo
            const select = document.getElementById('socioIdUsuario');
            select.innerHTML = `<option value="${s.id}">${s.nombre} (${s.email})</option>`;
            select.value = s.id;
            select.disabled = true;

            document.getElementById('socioApellidoPaterno').value = s.apellidoPaterno || '';
            document.getElementById('socioApellidoMaterno').value = s.apellidoMaterno || '';
            document.getElementById('socioGrado').value = s.grado || '';
            document.getElementById('socioGenero').value = s.genero || '';
            document.getElementById('socioFechaNacimiento').value = s.fechaNacimiento || '';
            document.getElementById('socioCelular').value = s.celular || '';
            document.getElementById('socioDepartamento').value = s.departamento || '';
            document.getElementById('socioProvincia').value = s.provincia || '';
            document.getElementById('socioDistrito').value = s.distrito || '';
            document.getElementById('socioCineplanetFavorito').value = s.cineplanetFavorito || '';
            document.getElementById('socioPuntos').value = s.puntos || 0;
            document.getElementById('socioEmpleado').value = s.empleado || 0;
            document.getElementById('socioPassword').value = '';
            document.getElementById('socioPassword').required = false;
            document.getElementById('socioPassword').placeholder = '⏭️ Dejar vacío para mantener contraseña';
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    } catch (error) {
        mostrarAlerta('❌ ' + error.message, 'error');
    } finally {
        mostrarCarga(false);
    }
}

// Al limpiar el formulario, habilita el select y recarga los usuarios disponibles
document.getElementById('socioForm').addEventListener('reset', () => {
    const select = document.getElementById('socioIdUsuario');
    select.disabled = false;
    cargarUsuariosSelect();
});

function afterGuardarSocio() {
    document.getElementById('socioIdUsuario').disabled = false;
}

async function eliminarSocio(id) {
    if (confirm('⚠️ ¿Eliminar este socio?')) {
        mostrarCarga(true);
        try {
            const response = await fetch(API + `socios/eliminar.php?id=${id}`, { method: 'DELETE' });
            const data = await manejarRespuesta(response, 'eliminar socio');
            
            if (data.success) {
                mostrarAlerta('✅ Socio eliminado', 'success');
                cargarSocios();
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

// === UBIGEO PERÚ: DEPARTAMENTO, PROVINCIA, DISTRITO ===
let departamentos = [];
let provincias = [];
let distritos = [];

async function cargarDepartamentos() {
    const departamentoSelect = document.getElementById('socioDepartamento');
    if (!departamentoSelect) return;
    departamentoSelect.innerHTML = '<option value="">Seleccione departamento</option>';
    try {
        const respuesta = await fetch('https://raw.githubusercontent.com/joseluisq/ubigeos-peru/master/json/departamentos.json');
        const data = await respuesta.json();
        departamentos = Object.values(data);
        departamentos.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep.nombre_ubigeo;
            option.textContent = dep.nombre_ubigeo;
            departamentoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar departamentos:", error);
    }
}

async function cargarProvincias() {
    try {
        const respuesta = await fetch('https://raw.githubusercontent.com/joseluisq/ubigeos-peru/master/json/provincias.json');
        const data = await respuesta.json();
        if (Array.isArray(data)) {
            provincias = data.flat(Infinity);
        } else if (Array.isArray(data.provincias)) {
            provincias = data.provincias.flat(Infinity);
        } else if (typeof data === 'object') {
            provincias = Object.values(data).flat(Infinity);
        } else {
            provincias = [];
        }
    } catch (error) {
        console.error("Error al cargar provincias:", error);
    }
}

async function cargarDistritos() {
    try {
        const respuesta = await fetch('https://raw.githubusercontent.com/joseluisq/ubigeos-peru/master/json/distritos.json');
        const data = await respuesta.json();
        if (Array.isArray(data)) {
            distritos = data.flat(Infinity);
        } else if (Array.isArray(data.distritos)) {
            distritos = data.distritos.flat(Infinity);
        } else if (typeof data === 'object') {
            distritos = Object.values(data).flat(Infinity);
        } else {
            distritos = [];
        }
    } catch (error) {
        console.error("Error al cargar distritos:", error);
    }
}

// Eventos para selects
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDepartamentos();
    await cargarProvincias();
    await cargarDistritos();

    const departamentoSelect = document.getElementById('socioDepartamento');
    const provinciaSelect = document.getElementById('socioProvincia');
    const distritoSelect = document.getElementById('socioDistrito');

    if (departamentoSelect && provinciaSelect) {
        departamentoSelect.addEventListener('change', function () {
            provinciaSelect.innerHTML = '<option value="">Seleccione provincia</option>';
            provinciaSelect.disabled = true;
            const nombreDepartamento = this.value;
            const depObj = departamentos.find(dep => dep.nombre_ubigeo === nombreDepartamento);
            if (!depObj) return;
            const idDepartamento = depObj.id_ubigeo;
            const provinciasFiltradas = provincias.filter(
                p => typeof p.id_padre_ubigeo !== "undefined" &&
                     String(p.id_padre_ubigeo).trim() === String(idDepartamento).trim()
            );
            if (provinciasFiltradas.length > 0) {
                provinciasFiltradas.forEach(prov => {
                    const option = document.createElement('option');
                    option.value = prov.nombre_ubigeo;
                    option.textContent = prov.nombre_ubigeo;
                    provinciaSelect.appendChild(option);
                });
                provinciaSelect.disabled = false;
            } else {
                provinciaSelect.innerHTML = '<option value="">No hay provincias</option>';
            }
        });
    }

    if (provinciaSelect && distritoSelect) {
        provinciaSelect.addEventListener('change', function () {
            distritoSelect.innerHTML = '<option value="">Seleccione distrito</option>';
            distritoSelect.disabled = true;
            const nombreProvincia = this.value;
            const provObj = provincias.find(prov => prov.nombre_ubigeo === nombreProvincia);
            if (!provObj) return;
            const idProvincia = provObj.id_ubigeo;
            const distritosFiltrados = distritos.filter(
                d => typeof d.id_padre_ubigeo !== "undefined" &&
                     String(d.id_padre_ubigeo).trim() === String(idProvincia).trim()
            );
            if (distritosFiltrados.length > 0) {
                distritosFiltrados.forEach(dist => {
                    const option = document.createElement('option');
                    option.value = dist.nombre_ubigeo;
                    option.textContent = dist.nombre_ubigeo;
                    distritoSelect.appendChild(option);
                });
                distritoSelect.disabled = false;
            } else {
                distritoSelect.innerHTML = '<option value="">No hay distritos</option>';
            }
        });
    }
});

// ==================== EXPORTAR ====================
export { cargarUsuariosSelect, cargarSocios, guardarSocio, editarSocio, eliminarSocio };
