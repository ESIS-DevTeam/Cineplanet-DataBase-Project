let urlCheckboxesMarcados = false;

document.addEventListener('DOMContentLoaded', () => {
    cargarPeliculasYFiltros();
    document.getElementById('filtros-peliculas').addEventListener('change', onFiltroChange);
});

function onFiltroChange(e) {
    // Guarda los valores seleccionados antes de actualizar
    const seleccionados = obtenerFiltrosSeleccionados();
    cargarPeliculasYFiltros(seleccionados);
}

function cargarPeliculasYFiltros(seleccionadosPrevios = null) {
    const filtros = seleccionadosPrevios || obtenerFiltrosSeleccionados();
    const params = new URLSearchParams(filtros).toString();
    fetch(`../../backend/api/getPeliculasFiltro.php?${params}`)
        .then(res => res.json())
        .then(peliculas => {
            mostrarPeliculas(peliculas);
            mostrarFiltrosDinamicos(peliculas, filtros);
            mostrarFiltroFechas(peliculas, filtros);
            if (!urlCheckboxesMarcados) {
                marcarCheckboxesPorURL();
                urlCheckboxesMarcados = true;
            }
        });
}

function mostrarPeliculas(peliculas) {
    const contenedor = document.getElementById('contenedorPeliculas');
    contenedor.innerHTML = '';
    const idsMostrados = new Set();
    peliculas.forEach(pelicula => {
        if (idsMostrados.has(pelicula.idPelicula)) return;
        idsMostrados.add(pelicula.idPelicula);

        const card = document.createElement('div');
        card.className = 'pelicula-card'; // Clase para el cuadro

        const img = document.createElement('img');
        img.src = pelicula.portada || 'img/default-pelicula.jpg';
        img.alt = pelicula.nombrePelicula || 'Sin título';

        const titulo = document.createElement('h3');
        titulo.textContent = pelicula.nombrePelicula || 'Sin título';

        const duracion = document.createElement('p');
        duracion.textContent = `Duración: ${pelicula.duracion || 'N/A'} min`;

        const restriccion = document.createElement('p');
        restriccion.textContent = `Restricción: ${pelicula.restriccionEdad || 'N/A'}`;

        card.appendChild(img);
        card.appendChild(titulo);
        card.appendChild(duracion);
        card.appendChild(restriccion);

        contenedor.appendChild(card);
    });
}

function mostrarFiltrosDinamicos(peliculas, seleccionados) {
    // Extraer opciones únicas de cada filtro según las películas visibles
    const ciudades = new Set();
    const cines = new Set();
    const generos = new Set();
    const idiomas = new Set();
    const formatos = new Set();
    const censuras = new Set();

    peliculas.forEach(p => {
        if (p.ciudad) ciudades.add(JSON.stringify({id: p.idCiudad, nombre: p.ciudad}));
        if (p.nombreCine) cines.add(JSON.stringify({id: p.idCine, nombre: p.nombreCine}));
        if (p.genero) generos.add(JSON.stringify({id: p.idGenero, nombre: p.genero}));
        if (p.idIdioma && p.idioma) idiomas.add(JSON.stringify({id: p.idIdioma, nombre: p.idioma}));
        if (p.formato) formatos.add(JSON.stringify({id: p.idFormato, nombre: p.formato}));
        if (p.restriccionEdad) censuras.add(JSON.stringify({id: p.idRestriccion, nombre: p.restriccionEdad}));
    });

    renderCheckboxes('contenedorCiudades', ciudades, 'ciudad', seleccionados);
    renderCheckboxes('contenedorCines', cines, 'cine', seleccionados);
    renderCheckboxes('contenedorGeneros', generos, 'genero', seleccionados);
    renderCheckboxes('contenedorIdiomas', idiomas, 'idioma', seleccionados);
    renderCheckboxes('contenedorFormato', formatos, 'formato', seleccionados);
    renderCheckboxes('contenedorCensura', censuras, 'censura', seleccionados);
}

function renderCheckboxes(contenedorId, opcionesSet, filtroName, seleccionados) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    const seleccionadosArr = seleccionados && seleccionados[filtroName]
        ? seleccionados[filtroName].split(',')
        : [];
    Array.from(opcionesSet).map(str => JSON.parse(str)).forEach(opcion => {
        const label = document.createElement('label');
        label.style.display = 'block';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = opcion.id;
        input.name = filtroName; // Asegura que el name sea correcto
        if (seleccionadosArr.includes(String(opcion.id))) input.checked = true;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + opcion.nombre));
        contenedor.appendChild(label);
    });
}

// Filtro de fechas dinámico basado en las funciones de las películas visibles
function mostrarFiltroFechas(peliculas, seleccionados) {
    const contenedorFecha = document.getElementById('filtro-fecha');
    if (!contenedorFecha) return;

    const fechasUnicas = new Set();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    peliculas.forEach(p => {
        if (p.fecha) {
            const [year, month, day] = p.fecha.split('-');
            const fechaFuncion = new Date(year, month - 1, day);
            fechaFuncion.setHours(0, 0, 0, 0);
            if (fechaFuncion >= hoy) {
                fechasUnicas.add(p.fecha);
            }
        }
    });

    const fechasOrdenadas = Array.from(fechasUnicas).sort();
    contenedorFecha.innerHTML = '';

    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const seleccionadosArr = seleccionados && seleccionados.dia
        ? seleccionados.dia.split(',')
        : [];

    fechasOrdenadas.forEach(fechaStr => {
        const [year, month, day] = fechaStr.split('-');
        const fecha = new Date(year, month - 1, day);
        fecha.setHours(0, 0, 0, 0);

        const nombreDia = diasSemana[fecha.getDay()];
        const esHoy = fecha.getFullYear() === hoy.getFullYear() &&
                      fecha.getMonth() === hoy.getMonth() &&
                      fecha.getDate() === hoy.getDate();

        let textoLabel;
        if (esHoy) {
            textoLabel = `hoy ${nombreDia}`;
        } else {
            textoLabel = `${nombreDia} ${fecha.getDate()}`;
        }

        const label = document.createElement('label');
        label.style.display = 'block';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'dia';
        checkbox.value = fechaStr;
        if (seleccionadosArr.includes(fechaStr)) checkbox.checked = true;

        label.appendChild(checkbox);
        label.append(` ${textoLabel}`);
        contenedorFecha.appendChild(label);
    });
}

function obtenerFiltrosSeleccionados() {
    const filtros = {};
    // ciudad
    const ciudad = Array.from(document.querySelectorAll('input[name="ciudad"]:checked')).map(e => e.value);
    if (ciudad.length) filtros.ciudad = ciudad.join(',');
    // cine
    const cine = Array.from(document.querySelectorAll('input[name="cine"]:checked')).map(e => e.value);
    if (cine.length) filtros.cine = cine.join(',');
    // genero
    const genero = Array.from(document.querySelectorAll('input[name="genero"]:checked')).map(e => e.value);
    if (genero.length) filtros.genero = genero.join(',');
    // idioma
    const idioma = Array.from(document.querySelectorAll('input[name="idioma"]:checked')).map(e => e.value);
    if (idioma.length) filtros.idioma = idioma.join(','); // Asegura que el parámetro sea 'idioma'
    // formato
    const formato = Array.from(document.querySelectorAll('input[name="formato"]:checked')).map(e => e.value);
    if (formato.length) filtros.formato = formato.join(',');
    // censura
    const censura = Array.from(document.querySelectorAll('input[name="censura"]:checked')).map(e => e.value);
    if (censura.length) filtros.censura = censura.join(',');
    // fecha
    const fecha = Array.from(document.querySelectorAll('input[name="dia"]:checked')).map(e => e.value);
    if (fecha.length) filtros.dia = fecha.join(',');
    return filtros;
}

function marcarCheckboxesPorURL() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        const selector = `input[name="${key}"][value="${value}"]`;
        const checkbox = document.querySelector(selector);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}
