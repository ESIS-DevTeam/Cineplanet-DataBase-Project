// Script para el header sticky con efectos al hacer scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
