function getFiltrosSeleccionados() {
    // idioma y formato como arrays
    const idiomas = Array.from(document.querySelectorAll('#idiomas-checkboxes input[type="checkbox"]:checked')).map(cb => cb.value);
    const formatos = Array.from(document.querySelectorAll('#formatos-checkboxes input[type="checkbox"]:checked')).map(cb => cb.value);
    return {
        ciudad: document.getElementById('select-ciudad').value,
        cine: document.getElementById('select-cine').value,
        dia: document.getElementById('select-dia').value,
        genero: document.getElementById('select-genero').value,
        idioma: idiomas.join(','), // enviar como string separado por coma
        formato: formatos.join(','), // enviar como string separado por coma
        censura: document.getElementById('select-censura').value
    };
}

function renderPeliculas(peliculas) {
    let contenedor = document.getElementById('peliculas-filtradas');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'peliculas-filtradas';
        contenedor.style.marginTop = '2em';
        document.getElementById('filtros-peliculas').after(contenedor);
    }
    contenedor.innerHTML = '';
    if (!peliculas.length) {
        contenedor.innerHTML = '<div>No hay películas que coincidan con los filtros.</div>';
        return;
    }
    peliculas.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pelicula-card';
        card.style.border = '1px solid #ccc';
        card.style.padding = '1em';
        card.style.marginBottom = '1em';
        card.style.background = '#f9f9f9';
        card.innerHTML = `
            <h3>${p.nombrePelicula}</h3>
            <img src="${p.portada || ''}" alt="Portada" style="max-width:120px;float:left;margin-right:1em;">
            <div><strong>Género:</strong> ${p.genero}</div>
            <div><strong>Censura:</strong> ${p.restriccionEdad}</div>
            <div><strong>Formato:</strong> ${p.formato}</div>
            <div><strong>Idioma:</strong> ${p.idioma}</div>
            <div><strong>Cine:</strong> ${p.nombreCine} (${p.ciudad})</div>
            <div><strong>Fecha:</strong> ${p.fecha} <strong>Hora:</strong> ${p.hora}</div>
            <div><strong>Precio:</strong> S/ ${p.precio}</div>
            <div style="clear:both;"></div>
            <div><strong>Sinopsis:</strong> ${p.sinopsis}</div>
        `;
        contenedor.appendChild(card);
    });
}

async function buscarPeliculas() {
    const filtros = getFiltrosSeleccionados();
    const params = Object.entries(filtros)
        .filter(([k, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    const url = `http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculasFiltro.php${params ? '?' + params : ''}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const peliculas = await res.json();
        renderPeliculas(peliculas);
    } catch (err) {
        console.error('Error buscando películas:', err);
        renderPeliculas([]);
    }
}

function setupFiltroListeners() {
    const ids = [
        'select-ciudad', 'select-cine', 'select-dia',
        'select-genero', 'select-idioma', 'select-formato', 'select-censura'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', buscarPeliculas);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupFiltroListeners();
    buscarPeliculas(); // inicial, muestra todo
});
