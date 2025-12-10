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
        <h2 class="cine-title">${nombreCine}</h2>
        <div class="tabs-header">
            <div class="tabs-container">
                <div id="tab-horarios" class="tab-item ${modo === 'horarios' ? 'active' : ''}">Horarios</div>
                <div id="tab-peliculas" class="tab-item ${modo === 'peliculas' ? 'active' : ''}">Películas</div>
            </div>
            ${modo === 'horarios' ? `
            <div class="date-selector-container">
                <select id="fecha-select"></select>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('tab-horarios').onclick = () => { 
        if(modo !== 'horarios') { modo = 'horarios'; cargarTodo(); }
    };
    document.getElementById('tab-peliculas').onclick = () => { 
        if(modo !== 'peliculas') { modo = 'peliculas'; cargarTodo(); }
    };

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

// Muestra "lunes 10/06"
function formatearFechaLabel(fecha) {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const f = new Date(fecha + 'T00:00:00');
    const diaNombre = dias[f.getDay()];
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    
    return `${diaNombre} ${dia}/${mes}`;
}

// Renderiza las funciones agrupadas por película, formato e idioma
function renderFunciones(funciones) {
    if (funciones.length === 0) {
        funcionesListDiv.innerHTML = '<div style="padding:20px;">No hay funciones para esta fecha.</div>';
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

        const imgSrc = peli.portada 
            ? '../images/portrait/peliculas/' + peli.portada 
            : '../images/items/icono-cine.ico';

        return `
        <div class="movie-row">
            <div class="movie-poster-container">
                <img src="${imgSrc}" alt="${peli.nombre}" class="movie-poster">
            </div>
            <div class="movie-details">
                <div class="movie-title">${peli.nombre} <span class="restriction-text">(${peli.restriccionNombre})</span></div>
                <div class="movie-meta">${peli.generoNombre}, ${peli.duracionStr}.</div>
                
                ${Object.values(grupos).map(grupo => `
                    <div class="format-row">
                        <div class="format-badges">
                            <span class="format-badge">2D</span>
                            <span class="format-badge">${grupo.formato}</span>
                            <span class="format-lang">${grupo.idioma || ''}</span>
                        </div>
                        <div class="time-buttons">
                            ${grupo.horas.map(h =>
                                `<button class="time-btn" onclick="window.location.href='asientos.html?funcion=${h.idFuncion}'">${h.hora}</button>`
                            ).join('')}
                        </div>
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
        funcionesListDiv.innerHTML = '<div style="padding:20px;">No hay películas disponibles en este cine.</div>';
        return;
    }
    funcionesListDiv.innerHTML = `
        <div class="movies-grid">
            ${peliculas.map(peli => {
                const imgSrc = peli.portada 
                    ? '../images/portrait/peliculas/' + peli.portada 
                    : '../images/items/icono-cine.ico';
                return `
                <div class="grid-movie-card" onclick="window.location.href='peliculaSeleccion.html?cine=${cineId}&pelicula=${peli.id}'">
                    <img src="${imgSrc}" alt="${peli.nombre}" class="grid-movie-poster">
                    <div class="grid-movie-title">${peli.nombre}</div>
                    <div class="grid-movie-meta">${peli.generoNombre}, ${peli.duracionStr}, ${peli.restriccionNombre}.</div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Carga las fechas disponibles con funciones activas
function cargarFechasDisponibles(nombreCine) {
    fetch(`${BASE_API_DOMAIN}cines/fechasFunciones.php?id=${cineId}`)
        .then(res => res.json())
        .then(data => {
            fechasDisponibles = data.fechas || [];
            if (!fechasDisponibles.includes(fechaSeleccionada)) {
                fechaSeleccionada = fechasDisponibles[0] || null;
            }
            renderCineInfo(nombreCine);
            cargarFunciones();
        });
}

// Carga las funciones activas para la fecha seleccionada
function cargarFunciones() {
    if (!fechaSeleccionada) {
        funcionesListDiv.innerHTML = '<div style="padding:20px;">No hay funciones disponibles.</div>';
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
