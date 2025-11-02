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
      contenedor.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        padding: 20px;
      `;
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
      contenedor.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No se encontraron películas</p>';
      return;
    }

    peliculas.forEach(pelicula => {
      const card = this.crearCard(pelicula);
      contenedor.appendChild(card);
    });
  },

  crearCard(pelicula) {
    const card = document.createElement('div');
    card.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      cursor: pointer;
    `;
    card.onmouseover = () => card.style.transform = 'scale(1.05)';
    card.onmouseout = () => card.style.transform = 'scale(1)';

    const portada = document.createElement('div');
    portada.style.cssText = `
      width: 100%;
      height: 300px;
      background: url('${pelicula.portada}') center/cover;
      background-color: #f0f0f0;
    `;

    const info = document.createElement('div');
    info.style.cssText = `
      padding: 15px;
    `;

    const titulo = document.createElement('h3');
    titulo.textContent = pelicula.nombrePelicula;
    titulo.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    const genero = document.createElement('p');
    genero.textContent = `Género: ${pelicula.genero}`;
    genero.style.cssText = `
      margin: 5px 0;
      font-size: 13px;
      color: #666;
    `;

    const duracion = document.createElement('p');
    duracion.textContent = `Duración: ${pelicula.duracion || 'N/A'} min`;
    duracion.style.cssText = `
      margin: 5px 0;
      font-size: 13px;
      color: #666;
    `;

    const restriccion = document.createElement('p');
    restriccion.textContent = `Clasificación: ${pelicula.restriccionEdad}`;
    restriccion.style.cssText = `
      margin: 5px 0;
      font-size: 13px;
      color: #d9534f;
      font-weight: bold;
    `;

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
    await this.cargarPeliculas();
    this.configurarEventosFiltros();
  },

  async cargarPeliculas() {
    const filtros = GestorFiltros.obtenerFiltros();
    const peliculas = await API.obtenerPeliculas(filtros);
    Renderizador.mostrarPeliculas(peliculas);
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
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  PeliculasFiltradas.inicializar();
});
