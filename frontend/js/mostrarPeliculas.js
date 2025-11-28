import BASE_API_DOMAIN from "./config.js";

let urlCheckboxesMarcados = false;

document.addEventListener('DOMContentLoaded', () => {
    // Primero, lee los filtros de la URL y obtén los valores seleccionados.
    const filtrosDesdeURL = obtenerFiltrosDesdeURL();
    // Luego, carga las películas y los filtros usando esos valores.
    cargarPeliculasYFiltros(filtrosDesdeURL);
    // Finalmente, añade el listener para futuros cambios.
    document.getElementById('filtros-peliculas').addEventListener('change', onFiltroChange);

    // Agrega los botones/tabs
    const contenedor = document.getElementById('contenedorPeliculas');
    contenedor.innerHTML = `
        <div id="peliculas-tabs" style="display:flex; justify-content:center; align-items:center; gap:32px; margin-bottom:24px;">
            <button id="tab-cartelera" style="background:none; border:none; font-weight:bold; font-size:1.1em; cursor:pointer; border-bottom:2px solid #007bff; padding:8px 24px;">En cartelera</button>
            <button id="tab-preventa" style="background:none; border:none; font-weight:normal; font-size:1.1em; cursor:pointer; padding:8px 24px;">Preventa</button>
        </div>
        <div id="peliculas-seccion"></div>
    `;
    let modo = 'cartelera';
    const seccion = document.getElementById('peliculas-seccion');

    function cargarCartelera() {
        const filtros = obtenerFiltrosSeleccionados();
        const params = new URLSearchParams(filtros).toString();
        fetch(BASE_API_DOMAIN + `getPeliculasFiltro.php?${params}`)
            .then(res => res.json())
            .then(peliculas => {
                seccion.innerHTML = '';
                mostrarPeliculas(peliculas, filtros);
                mostrarFiltrosDinamicos(peliculas, filtros); // Actualiza filtros según cartelera
                mostrarFiltroFechas(peliculas, filtros);
            });
    }

    function cargarPreventa() {
        const filtros = obtenerFiltrosSeleccionados();
        const params = new URLSearchParams({...filtros, preventa: 1}).toString();
        fetch(BASE_API_DOMAIN + `getPeliculasFiltro.php?${params}`)
            .then(res => res.json())
            .then(peliculas => {
                seccion.innerHTML = '';
                mostrarPeliculas(peliculas, filtros);
                mostrarFiltrosDinamicos(peliculas, filtros); // Actualiza filtros según preventa
                mostrarFiltroFechas(peliculas, filtros);
            });
    }

    document.getElementById('tab-cartelera').onclick = () => {
        modo = 'cartelera';
        document.getElementById('tab-cartelera').style.fontWeight = 'bold';
        document.getElementById('tab-cartelera').style.borderBottom = '2px solid #007bff';
        document.getElementById('tab-preventa').style.fontWeight = 'normal';
        document.getElementById('tab-preventa').style.borderBottom = 'none';
        cargarCartelera();
    };
    document.getElementById('tab-preventa').onclick = () => {
        modo = 'preventa';
        document.getElementById('tab-preventa').style.fontWeight = 'bold';
        document.getElementById('tab-preventa').style.borderBottom = '2px solid #007bff';
        document.getElementById('tab-cartelera').style.fontWeight = 'normal';
        document.getElementById('tab-cartelera').style.borderBottom = 'none';
        cargarPreventa();
    };

    // Inicializa mostrando cartelera
    cargarCartelera();

    // Filtros afectan la sección activa y se regeneran
    document.getElementById('filtros-peliculas').addEventListener('change', () => {
        if (modo === 'cartelera') cargarCartelera();
        else cargarPreventa();
    });
});

function onFiltroChange(e) {
    // Guarda los valores seleccionados antes de actualizar
    const seleccionados = obtenerFiltrosSeleccionados();
    cargarPeliculasYFiltros(seleccionados);
}

function cargarPeliculasYFiltros(seleccionadosPrevios = null) {
    const filtros = seleccionadosPrevios || obtenerFiltrosSeleccionados();
    const params = new URLSearchParams(filtros).toString();
    fetch(BASE_API_DOMAIN + `getPeliculasFiltro.php?${params}`)
        .then(res => res.json())
        .then(peliculas => {
            mostrarPeliculas(peliculas, filtros); // Pasar los filtros a mostrarPeliculas
            mostrarFiltrosDinamicos(peliculas, filtros);
            mostrarFiltroFechas(peliculas, filtros);
        });
}

function mostrarPeliculas(peliculas, filtros) {
    const seccion = document.getElementById('peliculas-seccion');
    if (!seccion) return;
    seccion.innerHTML = '';

    // Animación fade-in
    seccion.style.opacity = 0;
    setTimeout(() => { seccion.style.opacity = 1; }, 50);

    const idsMostrados = new Set();
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    grid.style.gap = '32px';
    grid.style.marginTop = '0px'; // Sin margen arriba, para que quede pegado debajo de los tabs

    const paramsFiltro = new URLSearchParams(filtros);

    peliculas.forEach(pelicula => {
        if (idsMostrados.has(pelicula.idPelicula)) return;
        idsMostrados.add(pelicula.idPelicula);

        const link = document.createElement('a');
        const linkParams = new URLSearchParams(paramsFiltro);
        linkParams.set('pelicula', pelicula.idPelicula);
        link.href = `peliculaSeleccion.html?${linkParams.toString()}`;
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        const card = document.createElement('div');
        card.className = 'pelicula-card';
        card.style.background = '#fff';
        card.style.border = '2px solid #007bff';
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 2px 8px #0002';
        card.style.padding = '12px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.transition = 'box-shadow 0.2s';
        card.onmouseover = () => card.style.boxShadow = '0 4px 16px #007bff44';
        card.onmouseout = () => card.style.boxShadow = '0 2px 8px #0002';

        const img = document.createElement('img');
        img.src = pelicula.portada
            ? `../images/portrait/movie/${pelicula.portada}`
            : 'img/default-pelicula.jpg';
        img.alt = pelicula.nombrePelicula || 'Sin título';
        img.style.width = '180px';
        img.style.height = '260px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.marginBottom = '10px';

        const titulo = document.createElement('h3');
        titulo.textContent = pelicula.nombrePelicula || 'Sin título';
        titulo.style.margin = '8px 0 6px 0';
        titulo.style.textAlign = 'center';
        titulo.style.fontWeight = 'bold';
        titulo.style.color = '#007bff';

        const duracion = document.createElement('p');
        duracion.textContent = `Duración: ${pelicula.duracion || 'N/A'} min`;
        duracion.style.margin = '2px 0';
        duracion.style.textAlign = 'center';

        const restriccion = document.createElement('p');
        restriccion.textContent = `Restricción: ${pelicula.restriccionEdad || 'N/A'}`;
        restriccion.style.margin = '2px 0';
        restriccion.style.textAlign = 'center';

        card.appendChild(img);
        card.appendChild(titulo);
        card.appendChild(duracion);
        card.appendChild(restriccion);

        link.appendChild(card);
        grid.appendChild(link);
    });

    seccion.appendChild(grid);
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

// Nueva función para leer los filtros directamente desde la URL
function obtenerFiltrosDesdeURL() {
    const filtros = {};
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
        if (filtros[key]) {
            filtros[key] += `,${value}`;
        } else {
            filtros[key] = value;
        }
    }
    return filtros;
}
