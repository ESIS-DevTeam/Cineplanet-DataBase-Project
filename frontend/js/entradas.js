document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const esInvitado = params.get('invitado') === '1';

    // Verifica sesión antes de mostrar la página
    const sessionRes = await fetch('../../backend/auth/checkSession.php');
    const sessionData = await sessionRes.json();
    if (!sessionData.loggedIn && !esInvitado) {
        // Oculta el contenido principal y muestra el modal de login
        document.getElementById('main-content').classList.add('oculto-por-modal');
        document.getElementById('main-header').classList.add('oculto-por-modal');
        const loginModal = document.getElementById('login-modal');
        const loginFrame = document.getElementById('login-frame');
        params.set('redirect', window.location.pathname + '?' + params.toString());
        params.set('fromEntradas', '1');
        loginFrame.src = `login.html?${params.toString()}`;
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        document.getElementById('close-login-modal').onclick = function() {
            loginModal.style.display = 'none';
            document.body.style.overflow = '';
            document.getElementById('main-content').classList.remove('oculto-por-modal');
            document.getElementById('main-header').classList.remove('oculto-por-modal');
        };
        return;
    } else {
        // Asegura que el contenido principal esté visible si no hay modal
        document.getElementById('main-content').classList.remove('oculto-por-modal');
        document.getElementById('main-header').classList.remove('oculto-por-modal');
        document.getElementById('login-modal').style.display = 'none';
        document.body.style.overflow = '';
    }

    const socioDisplay = document.getElementById('socio-display');
    if (sessionData.socio && sessionData.socio.nombre) {
        const nombre = sessionData.socio.nombre;
        const iniciales = nombre.split(' ').map(word => word[0]).join('').toUpperCase();
        socioDisplay.textContent = iniciales;
    } else {
        socioDisplay.textContent = '👤';
    }

    // Extrae parámetros de la URL
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');

    if (!idFuncion) {
        document.getElementById('info-container').textContent = 'No se ha seleccionado función.';
        return;
    }

    // Obtener datos completos de la función y película
    let infoFuncion = null;
    try {
        const resInfo = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
        infoFuncion = await resInfo.json();
    } catch {
        document.getElementById('info-container').textContent = 'Error al obtener la información de la función.';
        return;
    }

    // Formatear fecha
    let fechaTexto = '';
    if (infoFuncion && infoFuncion.fecha) {
        const fechaObj = new Date(infoFuncion.fecha + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        if (fechaObj.getTime() === hoy.getTime()) {
            fechaTexto = `Hoy, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
        } else {
            const diasSemana = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
            fechaTexto = `${diasSemana[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
        }
    }

    // Muestra la información igual que en asientos.js
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
        <div style="text-align:center;">
            ${infoFuncion.portada ? `<img src="${infoFuncion.portada}" alt="Portada" style="width:140px;height:140px;border-radius:50%;object-fit:cover;">` : ''}
        </div>
        <h2 style="font-weight:bold; margin:0.5em 0;">${infoFuncion.nombrePelicula || ''}</h2>
        <div style="margin-bottom:0.5em;">${infoFuncion.formato || ''}${infoFuncion.formato && infoFuncion.idioma ? ', ' : ''}${infoFuncion.idioma || ''}</div>
        <div style="font-weight:bold; margin-bottom:0.5em;">${infoFuncion.nombreCine || ''}</div>
        <div style="margin-bottom:0.3em;">
            <span>📅 ${fechaTexto}</span>
        </div>
        <div style="margin-bottom:0.3em;">
            <span>🕒 ${infoFuncion.hora || ''}</span>
        </div>
        <div>
            <span>🏢 ${infoFuncion.nombreSala || ''}</span>
        </div>
        <hr style="margin:1em 0;">
    `;
    document.getElementById('info-container').appendChild(infoDiv);

    // Botones
    const btnVolver = document.getElementById('btn-volver');
    const btnContinuar = document.getElementById('btn-continuar');

    btnVolver.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = `asientos.html?${params.toString()}`;
    });

    // btnContinuar.disabled = false; // Habilita según tu lógica
    btnContinuar.addEventListener('click', () => {
        alert('Continuar con la compra...');
    });

    // Mostrar las entradas usando solo promociones
    let promos = [];
    let precioBase = 0;
    try {
        const res = await fetch(`../../backend/api/getPromosEntradas.php?idFuncion=${idFuncion}${esInvitado ? '' : '&socio=1'}`);
        const data = await res.json();
        promos = data.promos || [];
        precioBase = data.precioBase || 0;
    } catch {
        document.getElementById('info-container').innerHTML += '<div>Error al obtener las promociones.</div>';
        return;
    }

    // Renderiza las entradas (promos)
    const entradasDiv = document.createElement('div');
    entradasDiv.innerHTML = `<h2>Entradas disponibles</h2>`;
    promos.forEach(p => {
        entradasDiv.innerHTML += `
            <div>
                <strong>${p.nombre}</strong><br>
                <span>${p.descripcion || ''}</span><br>
                <span>Precio base: S/ ${precioBase.toFixed(2)}</span><br>
                <span>Precio final: S/ ${p.precioFinal.toFixed(2)}${p.precioFinal < precioBase ? ' <span style="color:red;">Descuento aplicado</span>' : ''}</span>
                <div>
                    <button type="button" data-type="menos" data-id="${p.id}">-</button>
                    <span id="cantidad-${p.id}">0</span>
                    <button type="button" data-type="mas" data-id="${p.id}">+</button>
                </div>
            </div>
        `;
    });

    document.getElementById('info-container').appendChild(entradasDiv);

    // Lógica para sumar/restar cantidad
    entradasDiv.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const type = e.target.getAttribute('data-type');
            const id = e.target.getAttribute('data-id');
            const span = document.getElementById('cantidad-' + id);
            let val = parseInt(span.textContent, 10);
            if (type === 'mas') val++;
            if (type === 'menos' && val > 0) val--;
            span.textContent = val;
        }
    });
});
