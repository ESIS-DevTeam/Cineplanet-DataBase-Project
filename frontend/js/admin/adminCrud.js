import BASE_API_DOMAIN from '../config.js';
import { cargarUsuarios, guardarUsuario, editarUsuario, eliminarUsuario } from './usuarios.js';
import { cargarUsuariosSelect, cargarSocios, guardarSocio, editarSocio, eliminarSocio, inicializarSocios } from './socios.js';
import { cargarPeliculas, guardarPelicula, editarPelicula, eliminarPelicula, inicializarPeliculas } from './peliculas.js';
import { cargarFunciones, guardarFuncion, editarFuncion, eliminarFuncion, inicializarFunciones } from './funciones.js';
import { cargarProductos, guardarProducto, editarProducto, eliminarProducto } from './productos.js';
import { cargarCines, editarCine, eliminarCine, inicializarCines, guardarCine } from './cines.js';
import { cargarSalas, guardarSala, editarSala, eliminarSala, inicializarSalas } from './salas.js';
import { cargarPromos, guardarPromo, editarPromo, eliminarPromo, inicializarPromos } from './promos.js';
import { setCatalogo, inicializarCatalogo } from './catalogo.js';

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
        
        const resFuncion = await fetch('./formularioFuncion.html');
        const resFuncionText = await resFuncion.text();
        document.getElementById('formularioFuncionContainer').innerHTML = resFuncionText;
        
        const resProducto = await fetch('./formularioProducto.html');
        const resProductoText = await resProducto.text();
        document.getElementById('formularioProductoContainer').innerHTML = resProductoText;

        const resCine = await fetch('./formularioCine.html');
        const resCineText = await resCine.text();
        document.getElementById('formularioCineContainer').innerHTML = resCineText;
        
        const resSala = await fetch('./formularioSala.html');
        const resSalaText = await resSala.text();
        document.getElementById('formularioSalaContainer').innerHTML = resSalaText;
        
        const resPromo = await fetch('./formularioPromo.html');
        const resPromoText = await resPromo.text();
        document.getElementById('formularioPromoContainer').innerHTML = resPromoText;
        
        // Catálogo: un solo formulario reutilizable
        const resCatalogo = await fetch('./formularioCatalogo.html');
        document.getElementById('formularioCatalogoContainer').innerHTML = await resCatalogo.text();
        
        await inicializarPeliculas();
        await inicializarSocios();
        await inicializarFunciones();
        await inicializarCines();
        await inicializarSalas();
        await inicializarPromos();
    } catch (error) {
        console.error('Error al cargar formularios:', error);
        mostrarAlerta('❌ Error al cargar formularios', 'error');
    }
}

// ==================== CAMBIO DE PESTAÑAS ====================
function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    if (event) event.target.classList.add('active');

    if (tabName === 'usuarios') cargarUsuarios();
    if (tabName === 'socios') { cargarSocios(); cargarUsuariosSelect(); }
    if (tabName === 'peliculas') cargarPeliculas();
    if (tabName === 'funciones') { cargarFunciones(); inicializarFunciones(); }
    if (tabName === 'productos') cargarProductos();
    if (tabName === 'cines') cargarCines();
    if (tabName === 'salas') { cargarSalas(); inicializarSalas(); }
    if (tabName === 'promos') { cargarPromos(); inicializarPromos(); }
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
window.guardarFuncion = guardarFuncion;
window.editarFuncion = editarFuncion;
window.eliminarFuncion = eliminarFuncion;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.guardarCine = guardarCine;
window.editarCine = editarCine;
window.eliminarCine = eliminarCine;
window.guardarSala = guardarSala;
window.editarSala = editarSala;
window.eliminarSala = eliminarSala;
window.guardarPromo = guardarPromo;
window.editarPromo = editarPromo;
window.eliminarPromo = eliminarPromo;
window.mostrarAlerta = mostrarAlerta;

window.switchCatalogo = function(tabName, event) {
    document.querySelectorAll('.tab-btn-catalogo').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    setCatalogo(tabName);
    inicializarCatalogo();
};

// ==================== INICIALIZAR ====================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM Cargado - Inicializando Admin Panel');
    await cargarFormularios();
    window.switchCatalogo('generos');
    cargarUsuarios();
});
