// Script para el header sticky con efectos al hacer scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Script para el menú desplegable del usuario
document.addEventListener('DOMContentLoaded', function() {
    const socioBtn = document.querySelector('.socio-btn');
    const socioDropdown = document.getElementById('socioDropdown');
    
    if (socioBtn && socioDropdown) {
        // Toggle dropdown al hacer click en el botón
        socioBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            socioDropdown.classList.toggle('show');
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!socioBtn.contains(e.target) && !socioDropdown.contains(e.target)) {
                socioDropdown.classList.remove('show');
            }
        });
        
        // Prevenir que el dropdown se cierre al hacer click dentro
        socioDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});
