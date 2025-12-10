// Banner Slider dinámico desde la base de datos
const API_URL = 'backend/api/getPeliculasDestacadas.php';

let currentSlide = 0;
let slides = [];
let autoSlideInterval;

// Cargar películas destacadas desde la API
async function cargarPeliculasDestacadas() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            slides = data.data;
            renderizarSlides();
            iniciarAutoSlide();
        } else {
            console.error('No se encontraron películas destacadas');
        }
    } catch (error) {
        console.error('Error al cargar películas destacadas:', error);
    }
}

// Renderizar los slides dinámicamente
function renderizarSlides() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    // Limpiar slides existentes
    sliderContainer.innerHTML = '';
    
    // Crear slides dinámicamente
    slides.forEach((pelicula, index) => {
        const slide = document.createElement('article');
        slide.className = `slide ${index === 0 ? 'active' : 'hidden'}`;
        slide.dataset.slide = index + 1;
        
        slide.innerHTML = `
            <div class="slide-image">
                <img src="${pelicula.frame}" alt="${pelicula.nombre}" class="slide-bg">
            </div>
            <div class="slide-content">
                <div class="slide-text">
                    <h2 class="slide-text-title">${pelicula.nombre}</h2>
                    <p class="slide-text-sinopsis">${pelicula.sinopsis || 'Sin descripción disponible'}</p>
                </div>
                <div class="slide-actions">
                    <button class="slide-button" onclick="irACompra(${pelicula.id})">Comprar</button>
                </div>
            </div>
        `;
        
        sliderContainer.appendChild(slide);
    });
    
    // Renderizar indicadores
    renderizarIndicadores();
}

// Renderizar indicadores de navegación
function renderizarIndicadores() {
    const indicatorsContainer = document.querySelector('.slide-indicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    slides.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
        indicator.dataset.slide = index;
        indicator.setAttribute('aria-label', `Ir a slide ${index + 1}`);
        indicator.addEventListener('click', () => irASlide(index));
        
        indicatorsContainer.appendChild(indicator);
    });
}

// Navegar a un slide específico
function irASlide(index) {
    const allSlides = document.querySelectorAll('.slide');
    const allIndicators = document.querySelectorAll('.slide-indicator');
    
    if (index < 0 || index >= slides.length) return;
    
    // Ocultar slide actual
    allSlides[currentSlide].classList.remove('active');
    allSlides[currentSlide].classList.add('hidden');
    allIndicators[currentSlide].classList.remove('active');
    
    // Mostrar nuevo slide
    currentSlide = index;
    allSlides[currentSlide].classList.remove('hidden');
    allSlides[currentSlide].classList.add('active');
    allIndicators[currentSlide].classList.add('active');
    
    // Reiniciar auto-slide
    reiniciarAutoSlide();
}

// Slide anterior
function slideAnterior() {
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    irASlide(prevIndex);
}

// Slide siguiente
function slideSiguiente() {
    const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    irASlide(nextIndex);
}

// Auto-slide
function iniciarAutoSlide() {
    autoSlideInterval = setInterval(() => {
        slideSiguiente();
    }, 5000); // Cambia cada 5 segundos
}

function reiniciarAutoSlide() {
    clearInterval(autoSlideInterval);
    iniciarAutoSlide();
}

// Navegar a la página de compra
function irACompra(peliculaId) {
    window.location.href = `frontend/pages/peliculaSeleccion.html?id=${peliculaId}`;
}

// Event Listeners para controles
document.addEventListener('DOMContentLoaded', () => {
    // Cargar películas destacadas
    cargarPeliculasDestacadas();
    
    // Botones de navegación
    const btnPrev = document.querySelector('.slider-prev');
    const btnNext = document.querySelector('.slider-next');
    
    if (btnPrev) btnPrev.addEventListener('click', slideAnterior);
    if (btnNext) btnNext.addEventListener('click', slideSiguiente);
    
    // Pausar auto-slide al pasar el mouse
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        sliderContainer.addEventListener('mouseleave', iniciarAutoSlide);
    }
});
