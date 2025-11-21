import BASE_API_DOMAIN from './config.js';

function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

const cineId = getParam('id');
const cineInfoDiv = document.getElementById('cine-info');
const funcionesListDiv = document.getElementById('funciones-list');

let fechasDisponibles = [];
let fechaSeleccionada = null;
let modo = 'horarios'; // 'horarios' o 'peliculas'

// Renderiza el select de fechas y el título del cine
function renderCineInfo(nombreCine) {
    cineInfoDiv.innerHTML = `
        <h2 style="margin-bottom:8px;">${nombreCine}</h2>
        <div style="display:flex; align-items:center; gap:24px;">
            <span id="tab-horarios" style="cursor:pointer; font-weight:${modo === 'horarios' ? 'bold' : 'normal'}; border-bottom:${modo === 'horarios' ? '2px solid #007bff' : 'none'};">Horarios</span>
            <span id="tab-peliculas" style="cursor:pointer; margin-left:24px; font-weight:${modo === 'peliculas' ? 'bold' : 'normal'}; border-bottom:${modo === 'peliculas' ? '2px solid #007bff' : 'none'};">Películas</span>
            ${modo === 'horarios' ? `
            <div style="margin-left:24px;">
                <label for="fecha-select">Fecha:</label>
                <select id="fecha-select"></select>
            </div>
            ` : ''}
        </div>
    `;
    document.getElementById('tab-horarios').onclick = () => { modo = 'horarios'; cargarTodo(); };
    document.getElementById('tab-peliculas').onclick = () => { modo = 'peliculas'; cargarTodo(); };
    if (modo === 'horarios') {
        const fechaSelect = document.getElementById('fecha-select');
        fechaSelect.innerHTML = fechasDisponibles.map(f =>
            `<option value="${f}">${formatearFechaLabel(f)}</option>`
        ).join('');
        fechaSelect.value = fechaSeleccionada;
        fechaSelect.onchange = (e) => {
            fechaSeleccionada = e.target.value;
            cargarFunciones();
        };
    }
}

// Muestra "lunes 10/06/2024"
function formatearFechaLabel(fecha) {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const f = new Date(fecha);
    const diaNombre = dias[f.getDay()];
    const dia = String(f.getDate()).padStart(2, '0');

    return `${diaNombre} ${dia}`;
}

// Renderiza las funciones agrupadas por película, formato e idioma
function renderFunciones(funciones) {
    if (funciones.length === 0) {
        funcionesListDiv.innerHTML = '<div>No hay funciones para esta fecha.</div>';
        return;
    }
    // Agrupa por película
    const pelis = {};
    funciones.forEach(f => {
        if (!pelis[f.pelicula.id]) pelis[f.pelicula.id] = { ...f.pelicula, funciones: [] };
        pelis[f.pelicula.id].funciones.push(f);
    });
    funcionesListDiv.innerHTML = Object.values(pelis).map(peli => {
        // Agrupa funciones por formato/idioma
        const grupos = {};
        peli.funciones.forEach(f => {
            const key = f.formatoNombre + '-' + (f.idiomaNombre || '');
            if (!grupos[key]) grupos[key] = { formato: f.formatoNombre, idioma: f.idiomaNombre, horas: [] };
            grupos[key].horas.push({ hora: f.hora.slice(0,5), idFuncion: f.id });
        });
        return `
        <div style="display:flex; gap:24px; margin-bottom:32px;">
            <img src="${peli.portada || '../images/items/icono-cine.ico'}" alt="${peli.nombre}" style="width:180px; height:260px; object-fit:cover;">
            <div>
                <div style="font-weight:bold; font-size:1.1em;">${peli.nombre}</div>
                <div>${peli.generoNombre}, ${peli.duracionStr}, ${peli.restriccionNombre}</div>
                ${Object.values(grupos).map(grupo => `
                    <div style="margin:10px 0;">
                        <span style="border:1px solid #333; border-radius:6px; padding:2px 8px;">${grupo.formato}</span>
                        <span style="margin-left:8px;">${grupo.idioma || ''}</span>
                        <span style="margin-left:8px;">
                            ${grupo.horas.map(h =>
                                `<button style="margin:2px 4px; border:1px solid #ccc; border-radius:6px; padding:2px 10px; background:#f8f8f8;" onclick="window.location.href='asientos.html?funcion=${h.idFuncion}'">${h.hora}</button>`
                            ).join('')}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }).join('');
}

// Renderiza todas las películas disponibles en el cine (funciones activas y fecha >= hoy)
function renderPeliculas(peliculas) {
    if (!peliculas || peliculas.length === 0) {
        funcionesListDiv.innerHTML = '<div>No hay películas disponibles en este cine.</div>';
        return;
    }
    funcionesListDiv.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:32px;">
            ${peliculas.map(peli => `
                <div>
                    <img src="${peli.portada || '../images/items/icono-cine.ico'}" alt="${peli.nombre}" style="width:100%; height:260px; object-fit:cover;">
                    <div style="font-weight:bold; margin-top:8px;">${peli.nombre}</div>
                    <div>${peli.generoNombre}, ${peli.duracionStr}, ${peli.restriccionNombre}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Carga las fechas disponibles con funciones activas
function cargarFechasDisponibles(nombreCine) {
    fetch(`${BASE_API_DOMAIN}cines/fechasFunciones.php?id=${cineId}`)
        .then(res => res.json())
        .then(data => {
            fechasDisponibles = data.fechas || [];
            fechaSeleccionada = fechasDisponibles[0] || null;
            renderCineInfo(nombreCine);
            cargarFunciones();
        });
}

// Carga las funciones activas para la fecha seleccionada
function cargarFunciones() {
    if (!fechaSeleccionada) {
        funcionesListDiv.innerHTML = '<div>No hay funciones disponibles.</div>';
        return;
    }
    fetch(`${BASE_API_DOMAIN}cines/funciones.php?id=${cineId}&fecha=${fechaSeleccionada}`)
        .then(res => res.json())
        .then(data => renderFunciones(data.funciones || []));
}

// Carga la info del cine y las fechas disponibles o películas según el modo
function cargarTodo() {
    fetch(`${BASE_API_DOMAIN}cines/cineInfo.php?id=${cineId}`)
        .then(res => res.json())
        .then(data => {
            if (modo === 'horarios') {
                cargarFechasDisponibles(data.cine.nombre);
            } else {
                cineInfoDiv.innerHTML = '';
                renderCineInfo(data.cine.nombre);
                fetch(`${BASE_API_DOMAIN}cines/peliculas.php?id=${cineId}`)
                    .then(res => res.json())
                    .then(data => renderPeliculas(data.peliculas || []));
            }
        });
}

cargarTodo();
