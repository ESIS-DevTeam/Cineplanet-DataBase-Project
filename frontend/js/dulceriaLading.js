import BASE_API_DOMAIN from "./config.js";

const selectCiudad = document.getElementById('select-ciudad');
const selectCine = document.getElementById('select-cine');
const form = document.getElementById('form-ciudad-cine');
const btnContinuar = form.querySelector('button[type="submit"]');

function actualizarEstadoBoton() {
    if (selectCiudad.value && selectCine.value) {
        btnContinuar.disabled = false;
    } else {
        btnContinuar.disabled = true;
    }
}

async function cargarCiudades() {
    try {
        const res = await fetch(BASE_API_DOMAIN + 'getCiudades.php');
        const ciudades = await res.json();
        // Opción vacía para permitir el efecto de floating label
        selectCiudad.innerHTML = '<option value="" disabled selected hidden></option>';
        ciudades.forEach(ciudad => {
            const opt = document.createElement('option');
            opt.value = ciudad.id;
            opt.textContent = ciudad.nombre;
            selectCiudad.appendChild(opt);
        });
    } catch {
        selectCiudad.innerHTML = '<option value="">Error al cargar ciudades</option>';
    }
    actualizarEstadoBoton();
}

async function cargarCines(idCiudad) {
    // Opción vacía para permitir el efecto de floating label
    selectCine.innerHTML = '<option value="" disabled selected hidden></option>';
    selectCine.disabled = true;
    actualizarEstadoBoton(); // Deshabilitar botón al cambiar ciudad
    
    if (!idCiudad) return;
    try {
        const res = await fetch(BASE_API_DOMAIN + `getCinesPorCiudad.php?idCiudad=${idCiudad}`);
        const cines = await res.json();
        cines.forEach(cine => {
            const opt = document.createElement('option');
            opt.value = cine.id;
            opt.textContent = cine.nombre;
            selectCine.appendChild(opt);
        });
        selectCine.disabled = false;
    } catch {
        selectCine.innerHTML = '<option value="">Error al cargar cines</option>';
        selectCine.disabled = true;
    }
}

selectCiudad.addEventListener('change', e => {
    cargarCines(e.target.value);
});

selectCine.addEventListener('change', actualizarEstadoBoton);

form.addEventListener('submit', e => {
    e.preventDefault();
    const ciudadId = selectCiudad.value;
    const cineId = selectCine.value;
    if (!ciudadId || !cineId) {
        alert('Selecciona una ciudad y un cine.');
        return;
    }
    // Redirige a dulceria.html con los datos por la URL
    const params = new URLSearchParams();
    params.set('ciudad', ciudadId);
    params.set('cine', cineId);
    window.location.href = `dulceria.html?${params.toString()}`;
});

cargarCiudades();
