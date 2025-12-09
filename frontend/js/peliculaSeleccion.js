import BASE_API_DOMAIN from "./config.js";

async function mostrarInfoPelicula() {
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get('pelicula');
  const ciudad = params.get('ciudad');
  const cine = params.get('cine');
  const dia = params.get('dia');
  const infoDiv = document.getElementById('info-pelicula');

  if (!idPelicula) {
    infoDiv.textContent = 'No se ha seleccionado ninguna película.';
    return;
  }

  try { 
    const res = await fetch(BASE_API_DOMAIN + `getInfoPelicula.php?idPelicula=${idPelicula}`);
    const pelicula = await res.json();

    if (!pelicula || Object.keys(pelicula).length === 0) {
      infoDiv.textContent = 'Película no encontrada.';
      return;
    }

    // Idiomas y formatos pueden venir como string o array, normalizar
    let idiomas = pelicula.idiomas || pelicula.idioma || '';
    if (Array.isArray(idiomas)) idiomas = idiomas.join(', ');
    let formatos = pelicula.formatos || pelicula.formato || '';
    if (Array.isArray(formatos)) formatos = formatos.join(', ');

    // Trailer como fondo solo si es YouTube
    let youtubeId = '';
    if (pelicula.trailer) {
      const ytMatch = pelicula.trailer.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (ytMatch) youtubeId = ytMatch[1];
    }
    const trailerBg = document.getElementById('trailer-bg-container');
    if (youtubeId) {
      trailerBg.innerHTML = `
        <div style="position:relative;width:100vw;height:420px;">
          <iframe id="yt-trailer-iframe"
            src="https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&controls=0&showinfo=0&rel=0&enablejsapi=1"
            style="width:100vw;height:420px;background:#000;border:none;display:block;"
            allowfullscreen
          ></iframe>
          <div id="yt-trailer-overlay"
            style="position:absolute;top:0;left:0;width:100vw;height:420px;cursor:pointer;z-index:2;"
          ></div>
        </div>
      `;
      trailerBg.style.display = 'block';

      // Pausar/despausar al hacer clic en el overlay
      setTimeout(() => {
        const overlay = document.getElementById('yt-trailer-overlay');
        let player;
        function onYouTubeIframeAPIReady() {
          player = new window.YT.Player('yt-trailer-iframe');
        }
        // Cargar la API de YouTube si no está
        if (!window.YT || !window.YT.Player) {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
          window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        } else {
          onYouTubeIframeAPIReady();
        }
        overlay.onclick = function() {
          if (player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (state === 1) { // playing
              player.pauseVideo();
            } else {
              player.playVideo();
            }
          }
        };
      }, 400);
    } else {
      trailerBg.innerHTML = '';
      trailerBg.style.display = 'none';
    }

    infoDiv.innerHTML = `
      <div style="width:100%;">
        <div class="pelicula-header-row">
          <div class="pelicula-titulo"
            style="color:#004A8C;display:inline-block;font-family:'Montserrat',Arial,sans-serif;font-weight:900;font-size:60px;line-height:1.0666;margin:30px 0 20px;max-width:500px;position:relative;">
            ${pelicula.nombrePelicula || pelicula.nombre || 'Sin título'}
          </div>
          <button class="pelicula-comprar-btn" id="btn-comprar">
            <i class="fa-solid fa-ticket"></i> Comprar
          </button>
        </div>
        <div class="pelicula-datos-row"
          style="font:16px/1.5 'Lato',sans-serif;">
          <span>${pelicula.genero || pelicula.generoPelicula || ''}</span>
          <span>|</span>
          <span>${pelicula.duracion ? pelicula.duracion + 'min' : ''}</span>
          <span>|</span>
          <span>${pelicula.restriccionEdad || pelicula.clasificacion || ''}</span>
        </div>
        <div style="display:flex;gap:16px;align-items:flex-start;justify-content:center;margin-top:24px;">
          <div class="pelicula-portada" style="margin-top:40px;">
            ${pelicula.portada ? `<img src="../images/portrait/movie/${pelicula.portada}" alt="Portada" style="width:100%;border-radius:0px;">` : ''}
          </div>
          <div class="pelicula-sinopsis">
            <div class="sinopsis-bloques-container">
              <div class="bloque-azul-sinopsis"></div>
              <div class="bloque-gris-sinopsis">
                <h2 class="sinopsis-titulo">Sinopsis.</h2>
                <p class="sinopsis-texto">${pelicula.sinopsis || ''}</p>
                <div class="pelicula-datos">
                  <div style="margin-top:2em;">
                    <div class="sinopsis-label">Idioma</div>
                    <button type="button" class="sinopsis-idioma-btn" disabled>${idiomas}</button>
                  </div>
                  <div style="margin-top:1.5em;">
                    <div class="sinopsis-label">Disponible</div>
                    <div class="sinopsis-formatos">${formatos}</div>
                  </div>
                  ${ciudad ? `<div><strong>Ciudad:</strong> ${ciudad}</div>` : ''}
                  ${cine ? `<div><strong>Cine:</strong> ${cine}</div>` : ''}
                  ${dia ? `<div><strong>Fecha:</strong> ${dia}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Acción del botón comprar
    const btnComprar = document.getElementById('btn-comprar');
    if (btnComprar) {
      btnComprar.onclick = function() {
        const target = document.querySelector('.funcion-perfecta-flat-title');
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 60,
            behavior: 'smooth'
          });
        }
      };
    }
  } catch (err) {
    infoDiv.textContent = 'Error al cargar la película.';
  }
}

let allCines = [];
let allCiudades = [];
let allFechas = [];
let rawData = null;
let cinesFiltradosGlobal = [];
let funcionesPorCineGlobal = {}; // <-- nueva variable para guardar funciones

async function cargarOpcionesFuncionPelicula() {
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get('pelicula');
  if (!idPelicula) return;

  try {
    const res = await fetch(BASE_API_DOMAIN + `getOpcionesFuncionPelicula.php?pelicula=${idPelicula}`);
    const data = await res.json();
    rawData = data;

    allCiudades = data.ciudades;
    allCines = data.cines;
    allFechas = data.fechas;

    // Pre-cargar funciones para todos los cines
    for (const cine of allCines) {
      const funcionesRes = await fetch(
        BASE_API_DOMAIN + `getFuncionesPorCine.php?idPelicula=${idPelicula}&idCine=${cine.id}`
      );
      funcionesPorCineGlobal[cine.id] = await funcionesRes.json();
    }

    // Filtrar cines, ciudades y fechas para mostrar solo los que tienen funciones a partir de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cinesConFuncionesFuturas = new Set();
    allCines.forEach(cine => {
      const funciones = funcionesPorCineGlobal[cine.id] || {};
      for (const fechaStr in funciones) {
        const fecha = new Date(fechaStr + 'T00:00:00');
        if (fecha >= hoy) {
          cinesConFuncionesFuturas.add(cine.id);
          break; // El cine tiene funciones futuras, no necesita seguir buscando
        }
      }
    });

    allCines = allCines.filter(cine => cinesConFuncionesFuturas.has(cine.id));
    
    const ciudadesConCinesActivos = new Set(allCines.map(cine => cine.idCiudad));
    allCiudades = allCiudades.filter(ciudad => ciudadesConCinesActivos.has(ciudad.id));

    allFechas = allFechas.filter(fechaStr => {
      const fecha = new Date(fechaStr + 'T00:00:00');
      return fecha >= hoy;
    }).sort();

    actualizarSelects();
    preseleccionarDesdeURL();
    renderDetallesCines();
  } catch (err) {
    console.error('Error al cargar opciones:', err);
  }
}

function preseleccionarDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');

  const ciudadURL = params.get('ciudad');
  const cineURL = params.get('cine');
  const diaURL = params.get('dia');

  // Preseleccionar ciudad
  if (ciudadURL) {
    selectCiudad.value = ciudadURL;
  }

  // Preseleccionar cine
  if (cineURL) {
    selectCine.value = cineURL;
  }

  // Preseleccionar fecha
  if (diaURL) {
    selectFecha.value = diaURL;
  }

  // Actualizar selects para reflejar los cambios
  actualizarSelects();
}

function obtenerFechasDisponiblesPorCines(cinesIds) {
  const fechasSet = new Set();
  cinesIds.forEach(cineId => {
    const funciones = funcionesPorCineGlobal[cineId] || {};
    Object.keys(funciones).forEach(fecha => {
      fechasSet.add(fecha);
    });
  });
  return Array.from(fechasSet).sort();
}

function obtenerCinesConFecha(fechas) {
  const cinesSet = new Set();
  allCines.forEach(cine => {
    const funciones = funcionesPorCineGlobal[cine.id] || {};
    fechas.forEach(fecha => {
      if (funciones[fecha]) {
        cinesSet.add(cine.id);
      }
    });
  });
  return cinesSet;
}

function obtenerCiudadesConFecha(fechas) {
  const ciudadesSet = new Set();
  const cinesConFecha = obtenerCinesConFecha(fechas);
  cinesConFecha.forEach(cineId => {
    const cine = allCines.find(c => c.id == cineId);
    if (cine) ciudadesSet.add(cine.idCiudad);
  });
  return ciudadesSet;
}

function actualizarSelects() {
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');

  const ciudadSel = selectCiudad.value;
  const cineSel = selectCine.value;
  const fechaSel = selectFecha.value;

  // Determinar qué filtros aplicar
  let cinesFiltrados = allCines;
  let fechasFiltradas = allFechas;
  let ciudadesFiltradas = allCiudades;

  // Filtro 1: Por ciudad seleccionada
  if (ciudadSel) {
    cinesFiltrados = cinesFiltrados.filter(c => c.idCiudad == ciudadSel);
    fechasFiltradas = obtenerFechasDisponiblesPorCines(cinesFiltrados.map(c => c.id));
  }

  // Filtro 2: Por cine seleccionado (solo afecta ciudades y fechas, no a otros cines)
  if (cineSel) {
    const cine = allCines.find(c => c.id == cineSel);
    if (cine) {
      ciudadesFiltradas = allCiudades.filter(ci => ci.id == cine.idCiudad);
      fechasFiltradas = obtenerFechasDisponiblesPorCines([cine.id]);
    }
  }

  // Filtro 3: Por fecha seleccionada
  if (fechaSel) {
    const cinesConFecha = Array.from(obtenerCinesConFecha([fechaSel]));
    cinesFiltrados = cinesFiltrados.filter(c => cinesConFecha.includes(c.id));
    
    const ciudadesConFecha = Array.from(obtenerCiudadesConFecha([fechaSel]));
    ciudadesFiltradas = ciudadesFiltradas.filter(ci => ciudadesConFecha.includes(ci.id));
  }

  // Actualizar select de ciudades
  selectCiudad.innerHTML = '<option value="">Selecciona ciudad</option>';
  ciudadesFiltradas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == ciudadSel) opt.selected = true;
    selectCiudad.appendChild(opt);
  });

  // Actualizar select de cines
  selectCine.innerHTML = '<option value="">Selecciona cine</option>';
  cinesFiltrados.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    if (c.id == cineSel) opt.selected = true;
    selectCine.appendChild(opt);
  });

  // Actualizar select de fechas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  const fechasOrdenadas = fechasFiltradas
    .filter(fechaStr => {
      const fecha = new Date(fechaStr + 'T00:00:00');
      return fecha >= hoy;
    })
    .sort();

  selectFecha.innerHTML = '<option value="">Selecciona fecha</option>';
  fechasOrdenadas.forEach(fechaStr => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const diaNumero = fecha.getDate();
    const nombreDia = diasSemana[fecha.getDay()];
    let textoLabel;
    const esHoy = fecha.getTime() === hoy.getTime();

    if (esHoy) {
      textoLabel = `hoy ${nombreDia}`;
    } else {
      textoLabel = `${nombreDia} ${diaNumero}`;
    }

    const opt = document.createElement('option');
    opt.value = fechaStr;
    opt.textContent = textoLabel;
    if (fechaStr == fechaSel) opt.selected = true;
    selectFecha.appendChild(opt);
  });

  // Guardar cines filtrados globalmente
  cinesFiltradosGlobal = cinesFiltrados;
}

async function renderDetallesCines() {
  const idPelicula = new URLSearchParams(window.location.search).get('pelicula');
  const selectCiudad = document.getElementById('select-ciudad-funcion');
  const selectCine = document.getElementById('select-cine-funcion');
  const selectFecha = document.getElementById('select-fecha-funcion');
  const cinesContainer = document.getElementById('cines-details-container');

  // Usa los cines filtrados globalmente
  let cinesFiltrados = cinesFiltradosGlobal || [];
  const ciudadSeleccionada = selectCiudad.value;
  const cineSeleccionado = selectCine.value;
  const fechaSeleccionada = selectFecha.value;

  if (ciudadSeleccionada) {
    cinesFiltrados = cinesFiltrados.filter(c => c.idCiudad == ciudadSeleccionada);
  }
  if (cineSeleccionado) {
    cinesFiltrados = cinesFiltrados.filter(c => c.id == cineSeleccionado);
  }

  cinesContainer.innerHTML = '';
  for (const c of cinesFiltrados) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');

    // --- Nombre del cine ---
    const nameSpan = document.createElement('span');
    nameSpan.textContent = c.nombre;
    summary.appendChild(nameSpan);

    // --- Indicador abierto/cerrado (derecha) ---
    const icon = document.createElement('span');
    icon.className = 'cine-toggle-icon';
    icon.textContent = '+';
    summary.appendChild(icon);

    details.appendChild(summary);

    // Obtener funciones por cine usando el endpoint
    const funcionesRes = await fetch(
      BASE_API_DOMAIN + `getFuncionesPorCine.php?idPelicula=${idPelicula}&idCine=${c.id}`
    );
    const funcionesPorFecha = await funcionesRes.json();

    // Si hay filtro de fecha, solo mostrar funciones de esa fecha
    let funcionesFiltradas = funcionesPorFecha;
    if (fechaSeleccionada) {
      funcionesFiltradas = {};
      if (funcionesPorFecha[fechaSeleccionada]) {
        funcionesFiltradas[fechaSeleccionada] = funcionesPorFecha[fechaSeleccionada];
      }
    }

    // Agrupar por formato+idioma
    const grupos = {};
    Object.entries(funcionesFiltradas).forEach(([fechaStr, funciones]) => {
      // Determina si la fecha es hoy
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);
      const fechaFuncion = new Date(fechaStr + 'T00:00:00');
      fechaFuncion.setHours(0, 0, 0, 0);
      const esHoy = fechaFuncion.getTime() === ahora.getTime();

      funciones.forEach(funcion => {
        
        // Solo filtra por hora si es hoy
        if (esHoy) {
          const [hora, minuto] = funcion.hora.split(':');
          const horaFuncion = new Date();
          horaFuncion.setHours(hora, minuto, 0, 0);
          const ahoraHora = new Date();
          // Si la hora ya pasó hoy, no mostrar
          if (horaFuncion < ahoraHora) {
            return;
          }
        }
        const key = `${funcion.formato} ${funcion.idioma}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(funcion.hora);
      });
    });

    // Si no hay funciones, no mostrar el cine
    if (Object.keys(grupos).length === 0) continue;

    Object.entries(grupos).forEach(([titulo, horas]) => {
      // Extraer formato (badge) y resto (texto azul)
      const [formato, ...resto] = titulo.split(' ');
      const restoTexto = resto.join(' ').trim();

      // Contenedor del grupo
      const divGrupo = document.createElement('div');
      divGrupo.className = 'cine-funcion-grupo';

      // Encabezado: badge + texto azul
      const headerDiv = document.createElement('div');
      headerDiv.className = 'cine-funcion-header';
      headerDiv.innerHTML = `
        <span class="cine-funcion-badge">${formato}</span>
        <span class="cine-funcion-titulo">${restoTexto}</span>
      `;
      divGrupo.appendChild(headerDiv);

      // Grilla de horarios
      const grid = document.createElement('div');
      grid.className = 'cine-funcion-horarios-grid';

      horas.sort().forEach(hora => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cine-funcion-horario-btn';
        btn.innerHTML = `
          <span>${hora}</span>
          <span class="cine-funcion-horario-icon">
            <i class="fa-solid fa-chair"></i>
          </span>
        `;
        btn.style.marginRight = '';
        // Redirigir a asientos.html con idPelicula y idFuncion
        btn.addEventListener('click', () => {
          const funcionesLista = funcionesPorFecha[fechaSeleccionada || Object.keys(funcionesPorFecha)[0]];
          const funcionObj = funcionesLista.find(f => f.hora === hora);
          if (funcionObj && funcionObj.id) {
            const params = new URLSearchParams();
            params.set('pelicula', idPelicula);
            params.set('funcion', funcionObj.id);
            window.location.href = `asientos.html?${params.toString()}`;
          }
        });
        grid.appendChild(btn);
      });

      divGrupo.appendChild(grid);
      details.appendChild(divGrupo);
    });

    cinesContainer.appendChild(details);

    // Cambia el icono al abrir/cerrar
    details.addEventListener('toggle', function() {
      icon.textContent = details.open ? '–' : '+';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarInfoPelicula();
  cargarOpcionesFuncionPelicula();

  document.getElementById('select-ciudad-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
  document.getElementById('select-cine-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
  document.getElementById('select-fecha-funcion').addEventListener('change', () => {
    actualizarSelects();
    renderDetallesCines();
  });
});
