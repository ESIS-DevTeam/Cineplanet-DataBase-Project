// ============================================
// MÓDULO API - Comunicación con el backend
// ============================================
const API = {
  endpoint: 'http://localhost/Cineplanet-DataBase-Project/backend/api/getPeliculasFiltro.php',

  async obtenerPeliculas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
      if (filtros.cine) params.append('cine', filtros.cine);
      if (filtros.genero) params.append('genero', filtros.genero);
      if (filtros.idioma && filtros.idioma.length > 0) params.append('idioma', filtros.idioma.join(','));
      if (filtros.formato && filtros.formato.length > 0) params.append('formato', filtros.formato.join(','));
      if (filtros.censura) params.append('censura', filtros.censura);
      if (filtros.dia) params.append('dia', filtros.dia);

      const url = `${this.endpoint}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener películas:', error);
      return [];
    }
  }
};

// ============================================
// MÓDULO RENDERIZADO - Mostrar películas
// ============================================
const Renderizador = {
  contenedorId: 'contenedor-peliculas',

  inicializar(contenedorId = 'contenedor-peliculas') {
    this.contenedorId = contenedorId;
    if (!document.getElementById(this.contenedorId)) {
      const contenedor = document.createElement('div');
      contenedor.id = this.contenedorId;
      document.querySelector('main').appendChild(contenedor);
    }
  },

  limpiar() {
    const contenedor = document.getElementById(this.contenedorId);
    if (contenedor) contenedor.innerHTML = '';
  },

  mostrarPeliculas(peliculas) {
    this.limpiar();
    const contenedor = document.getElementById(this.contenedorId);

    if (!peliculas || peliculas.length === 0) {
      contenedor.innerHTML = '<p>No se encontraron películas</p>';
      return;
    }

    // Deduplicar películas por ID
    const peliculasUnicas = [];
    const idsVistos = new Set();
    
    peliculas.forEach(pelicula => {
      if (!idsVistos.has(pelicula.idPelicula)) {
        idsVistos.add(pelicula.idPelicula);
        peliculasUnicas.push(pelicula);
      }
    });

    peliculasUnicas.forEach(pelicula => {
      const cuadro = document.createElement('div');
      cuadro.className = 'pelicula-cuadro';
      cuadro.style.border = '2px solid #333';
      
      const card = this.crearCard(pelicula);
      cuadro.appendChild(card);
      contenedor.appendChild(cuadro);
    });
  },

  crearCard(pelicula) {
    const card = document.createElement('div');
    card.className = 'pelicula-card';

    const portada = document.createElement('div');
    portada.className = 'pelicula-portada';
    portada.style.backgroundImage = `url('${pelicula.portada}')`;

    const info = document.createElement('div');
    info.className = 'pelicula-info';

    const titulo = document.createElement('h3');
    titulo.textContent = pelicula.nombrePelicula;
    titulo.className = 'pelicula-titulo';

    const genero = document.createElement('p');
    genero.textContent = `Género: ${pelicula.genero}`;
    genero.className = 'pelicula-genero';

    const duracion = document.createElement('p');
    duracion.textContent = `Duración: ${pelicula.duracion || 'N/A'} min`;
    duracion.className = 'pelicula-duracion';

    const restriccion = document.createElement('p');
    restriccion.textContent = `Clasificación: ${pelicula.restriccionEdad}`;
    restriccion.className = 'pelicula-restriccion';

    info.appendChild(titulo);
    info.appendChild(genero);
    info.appendChild(duracion);
    info.appendChild(restriccion);

    card.appendChild(portada);
    card.appendChild(info);

    return card;
  }
};

// ============================================
// MÓDULO FILTROS - Gestionar selecciones
// ============================================
const GestorFiltros = {
  filtros: {
    ciudad: null,
    cine: null,
    genero: null,
    idioma: [],
    formato: [],
    censura: null,
    dia: null
  },

  obtenerFiltros() {
    return { ...this.filtros };
  },

  actualizarFiltro(nombre, valor) {
    if (Array.isArray(this.filtros[nombre])) {
      if (this.filtros[nombre].includes(valor)) {
        this.filtros[nombre] = this.filtros[nombre].filter(v => v !== valor);
      } else {
        this.filtros[nombre].push(valor);
      }
    } else {
      this.filtros[nombre] = this.filtros[nombre] === valor ? null : valor;
    }
  },

  limpiarFiltros() {
    this.filtros = {
      ciudad: null,
      cine: null,
      genero: null,
      idioma: [],
      formato: [],
      censura: null,
      dia: null
    };
  }
};

// ============================================
// MÓDULO PRINCIPAL - Orquestación
// ============================================
const PeliculasFiltradas = {
  async inicializar() {
    Renderizador.inicializar();
    this.sincronizarFiltrosConURL();
    await this.cargarPeliculas();
    this.configurarEventosFiltros();
  },

  sincronizarFiltrosConURL() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      if (GestorFiltros.filtros.hasOwnProperty(key)) {
        // Para filtros que aceptan múltiples valores (arrays)
        if (Array.isArray(GestorFiltros.filtros[key])) {
          const values = value.split(',');
          values.forEach(val => GestorFiltros.actualizarFiltro(key, val));
        } else {
          // Para filtros de valor único
          GestorFiltros.actualizarFiltro(key, value);
        }
      }
    });
  },

  async cargarPeliculas() {
    const filtros = GestorFiltros.obtenerFiltros();
    const peliculas = await API.obtenerPeliculas(filtros);
    Renderizador.mostrarPeliculas(peliculas);
    this.actualizarFiltrosDinamicosConPeliculas(peliculas); // <-- Actualiza los filtros dinámicos
  },

  configurarEventosFiltros() {
    const formFiltros = document.getElementById('filtros-peliculas');
    if (!formFiltros) return;

    formFiltros.addEventListener('change', async (e) => {
      const target = e.target;
      if (target.type === 'checkbox') {
        GestorFiltros.actualizarFiltro(target.name, target.value);
        await this.cargarPeliculas();
      }
    });

    // Limpiar todos los filtros
    const btnLimpiar = document.getElementById('limpiar-filtros');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', async () => {
        GestorFiltros.limpiarFiltros();
        
        // Desmarcar todos los checkboxes
        formFiltros.querySelectorAll('input[type="checkbox"]').forEach(chk => {
          chk.checked = false;
        });

        await this.cargarPeliculas();
      });
    }
  },

  actualizarFiltrosDinamicosConPeliculas(peliculas) {
    // Extrae los valores únicos de cada filtro de las películas filtradas
    const generosValidos = new Set(peliculas.map(p => String(p.idGenero)));
    const idiomasValidos = new Set(peliculas.map(p => String(p.idIdioma)));
    const formatosValidos = new Set(peliculas.map(p => String(p.idFormato)));
    const censurasValidas = new Set(peliculas.map(p => String(p.idRestriccion)));

    const actualizarFiltro = (contenedorId, valoresValidos) => {
      const cont = document.getElementById(contenedorId);
      if (!cont) return;
      Array.from(cont.querySelectorAll('input[type="checkbox"]')).forEach(chk => {
        if (valoresValidos.has(chk.value) || chk.checked) {
          chk.parentElement.style.display = 'block';
        } else {
          chk.parentElement.style.display = 'none';
          // No desmarcar si no es necesario, GestorFiltros maneja el estado
          // chk.checked = false; 
        }
      });
    };

    actualizarFiltro('contenedorGeneros', generosValidos);
    actualizarFiltro('contenedorIdiomas', idiomasValidos);
    actualizarFiltro('contenedorFormato', formatosValidos);
    actualizarFiltro('contenedorCensura', censurasValidas);
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  PeliculasFiltradas.inicializar();
});
