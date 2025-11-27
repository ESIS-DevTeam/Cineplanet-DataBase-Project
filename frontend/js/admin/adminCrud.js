import BASE_API_DOMAIN from '../config.js';
import { cargarUsuarios, guardarUsuario, editarUsuario, eliminarUsuario } from './usuarios.js';
import { cargarUsuariosSelect, cargarSocios, guardarSocio, editarSocio, eliminarSocio, inicializarSocios } from './socios.js';
import { cargarPeliculas, guardarPelicula, editarPelicula, eliminarPelicula, inicializarPeliculas } from './peliculas.js';

const API = BASE_API_DOMAIN + 'admin/';

// ==================== UTILIDADES ====================
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

// ==================== CARGAR FORMULARIOS ====================
async function cargarFormularios() {
    try {
        const resUsuario = await fetch('./formularioUsuario.html');
        const resUsuarioText = await resUsuario.text();
        document.getElementById('formularioUsuarioContainer').innerHTML = resUsuarioText;
        
        const resSocio = await fetch('./formularioSocio.html');
        const resSocioText = await resSocio.text();
        document.getElementById('formularioSocioContainer').innerHTML = resSocioText;
        
        const resPelicula = await fetch('./formularioPelicula.html');
        const resPeliculaText = await resPelicula.text();
        document.getElementById('formularioPeliculaContainer').innerHTML = resPeliculaText;
        await inicializarPeliculas();
        
        // Inicializar UBIGEO y eventos después de cargar formularios
        await inicializarSocios();
    } catch (error) {
        console.error('Error al cargar formularios:', error);
        mostrarAlerta('❌ Error al cargar formularios', 'error');
    }
}

// ==================== CAMBIO DE PESTAÑAS ====================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'usuarios') cargarUsuarios();
    if (tabName === 'socios') { cargarSocios(); cargarUsuariosSelect(); }
    if (tabName === 'peliculas') cargarPeliculas();
}

// ==================== EXPORTAR AL SCOPE GLOBAL ====================
window.switchTab = switchTab;
window.guardarUsuario = guardarUsuario;
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.guardarSocio = guardarSocio;
window.editarSocio = editarSocio;
window.eliminarSocio = eliminarSocio;
window.guardarPelicula = guardarPelicula;
window.editarPelicula = editarPelicula;
window.eliminarPelicula = eliminarPelicula;

// ==================== INICIALIZAR ====================
window.addEventListener('DOMContentLoaded', async () => {
    await cargarFormularios();
    cargarUsuarios();
});
