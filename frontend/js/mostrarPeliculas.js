import BASE_API_DOMAIN from "./config.js";

let urlCheckboxesMarcados = false;

document.addEventListener('DOMContentLoaded', () => {
    // Primero, lee los filtros de la URL y obtén los valores seleccionados.
    const filtrosDesdeURL = obtenerFiltrosDesdeURL();
    // Luego, carga las películas y los filtros usando esos valores.
    cargarPeliculasYFiltros(filtrosDesdeURL);
    // Finalmente, añade el listener para futuros cambios.
    document.getElementById('filtros-peliculas').addEventListener('change', onFiltroChange);

    let modo = 'cartelera';
    const seccion = document.getElementById('contenedorPeliculas');

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
        document.getElementById('tab-cartelera').style.color = '#003d82';
        document.getElementById('tab-cartelera').style.borderBottomColor = '#dc1e35';
        document.getElementById('tab-preventa').style.fontWeight = 'normal';
        document.getElementById('tab-preventa').style.color = '#222';
        document.getElementById('tab-preventa').style.borderBottomColor = 'transparent';
        cargarCartelera();
    };
    document.getElementById('tab-preventa').onclick = () => {
        modo = 'preventa';
        document.getElementById('tab-preventa').style.fontWeight = 'bold';
        document.getElementById('tab-preventa').style.color = '#003d82';
        document.getElementById('tab-preventa').style.borderBottomColor = '#dc1e35';
        document.getElementById('tab-cartelera').style.fontWeight = 'normal';
        document.getElementById('tab-cartelera').style.color = '#222';
        document.getElementById('tab-cartelera').style.borderBottomColor = 'transparent';
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
    const seccion = document.getElementById('contenedorPeliculas');
    if (!seccion) return;
    seccion.innerHTML = '';

    // Centrar el contenedor en la página
    seccion.style.display = 'flex';
    seccion.style.justifyContent = 'center';
    seccion.style.alignItems = 'center';
    seccion.style.width = '100%';
    seccion.style.minHeight = '500px';

    const idsMostrados = new Set();
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    grid.style.gap = '40px 32px';
    grid.style.marginTop = '0px';
    grid.style.justifyContent = 'center'; // Centra el grid

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
        card.style.border = 'none';
        card.style.borderRadius = '0';
        card.style.background = 'transparent'; // Fondo transparente
        card.style.boxShadow = 'none';        // Sin sombra
        card.style.padding = '0';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';
        card.style.position = 'relative';

        // Imagen
        const img = document.createElement('img');
        img.src = pelicula.portada
            ? `../images/portrait/movie/${pelicula.portada}`
            : 'img/default-pelicula.jpg';
        img.alt = pelicula.nombrePelicula || 'Sin título';
        img.style.width = '100%';
        img.style.height = '360px';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        img.style.borderRadius = '0'; // Sharp corners

        card.appendChild(img);

        // Info
        const infoContainer = document.createElement('div');
        infoContainer.style.padding = '18px 0 0 0';

        const titulo = document.createElement('h3');
        titulo.textContent = pelicula.nombrePelicula || 'Sin título';
        titulo.style.margin = '0 0 6px 0';
        titulo.style.fontSize = '1.25em';
        titulo.style.fontWeight = 'bold';
        titulo.style.color = '#222';
        titulo.style.fontFamily = "'Poppins',sans-serif";

        // Género, duración, restricción
        const detalles = document.createElement('div');
        detalles.style.fontSize = '1em';
        detalles.style.color = '#222';
        detalles.style.margin = '0 0 0 0';
        detalles.textContent = `${pelicula.genero || ''}${pelicula.genero ? ', ' : ''}${pelicula.duracion ? pelicula.duracion + 'min' : ''}${pelicula.restriccionEdad ? ', +' + pelicula.restriccionEdad : ''}`;

        infoContainer.appendChild(titulo);
        infoContainer.appendChild(detalles);

        card.appendChild(infoContainer);

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
        input.name = filtroName;
        input.style.display = 'none';
        const isChecked = seleccionadosArr.includes(String(opcion.id));
        if (isChecked) input.checked = true;
        
        // Aplicar color rojo si está marcado
        if (isChecked) {
            label.style.color = '#ff0000';
        }
        
        // Evento para actualizar color al cambiar
        input.addEventListener('change', () => {
            label.style.color = input.checked ? '#ff0000' : '#555';
        });
        
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

        // Aplicar color rojo si está marcado
        if (checkbox.checked) {
            label.style.color = '#ff0000';
        }

        // Evento para actualizar color al cambiar
        checkbox.addEventListener('change', () => {
            label.style.color = checkbox.checked ? '#ff0000' : '#555';
        });

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
