document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const esInvitado = params.get('invitado') === '1';

    // Calcular el máximo de entradas según la cantidad de asientos en la URL
    let asientosArr = [];
    if (params.get('asientos')) {
        asientosArr = params.get('asientos').split(',').filter(x => x.trim() !== '');
    }
    const maxEntradas = asientosArr.length || 1;

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

    let socioData = sessionData.socio || null;
    let esEmpleado = socioData && socioData.empleado == 1;
    let puntosSocio = socioData && socioData.puntos ? socioData.puntos : 0;

    // Extrae parámetros de la URL
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
        // ...existing code para armar entradasSeleccionadas y datosCompra...
       
        window.location.href = 'dulceria.html';
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

    // NUEVO: obtener el stock disponible por usuario para cada promo con stock
    async function obtenerStockPromoUsuario(promo, idUsuario) {
        if (!promo.tieneStock || promo.stock === null) return promo.stock;
        // Si no hay usuario, retorna el stock general
        if (!idUsuario) return promo.stock;
        try {
            const res = await fetch(`../../backend/api/getPromoStockUsuario.php?idPromo=${promo.id}&idUsuario=${idUsuario}`);
            const data = await res.json();
            if (data && typeof data.stockDisponible === 'number') {
                return data.stockDisponible;
            }
        } catch {}
        return promo.stock;
    }

    // Separar promos en generales y beneficios
    const generales = [];
    const beneficios = [];
    for (const p of promos) {
        // Solo muestra promos de empleados si el usuario es empleado
        if (p.requiereEmpleado && !esEmpleado) continue;

        // Obtiene el stock real disponible para el usuario si aplica
        if (p.tieneStock && p.stock !== null && socioData && socioData.id) {
            p.stock = await obtenerStockPromoUsuario(p, socioData.id);
        }

        // Generales: no requiere socio, empleado ni puntos
        if (!p.requiereSocio && !p.requiereEmpleado && !p.requierePuntos) {
            generales.push(p);
        } else {
            beneficios.push(p);
        }
    }

    // Renderiza las entradas generales
    const generalesDiv = document.createElement('div');
    generalesDiv.innerHTML = `<h2>Entradas generales</h2>`;
    generales.forEach(p => {
        // Muestra el stock si tieneStock está activo
        let stockInfo = '';
        if (p.tieneStock && p.stock !== null) {
            stockInfo = `<span style="color:#b00;">Stock disponible: ${p.stock}</span><br>`;
        }
        generalesDiv.innerHTML += `
            <div>
                <strong>${p.nombre}</strong><br>
                <span>${p.descripcion || ''}</span><br>
                ${stockInfo}
                <span>S/${p.precioFinal.toFixed(2)}${p.precioFinal < precioBase ? ' Precio más bajo' : ''}</span>
                <div>
                    <button type="button" data-type="menos" data-id="${p.id}" data-grupo="general">-</button>
                    <span id="cantidad-${p.id}">0</span>
                    <button type="button" data-type="mas" data-id="${p.id}" data-grupo="general">+</button>
                </div>
            </div>
        `;
    });

    // Renderiza los beneficios
    const beneficiosDiv = document.createElement('div');
    beneficiosDiv.innerHTML = `<h2>Tus Beneficios</h2>`;
    beneficios.forEach(p => {
        let stockInfo = '';
        if (p.tieneStock && p.stock !== null) {
            stockInfo = `<span style="color:#b00;">Stock disponible: ${p.stock}</span><br>`;
        }
        // NUEVO: agrega un span con id para mostrar puntos disponibles dinámicamente
        beneficiosDiv.innerHTML += `
            <div>
                <strong>${p.nombre}</strong><br>
                <span>${p.descripcion || ''}</span><br>
                ${p.requierePuntos && socioData ? `<span id="puntos-disponibles-${p.id}">Puntos disponibles: ${puntosSocio}</span><br>` : ''}
                ${stockInfo}
                <span>S/${p.precioFinal.toFixed(2)}</span>
                <div>
                    <button type="button" data-type="menos" data-id="${p.id}" data-grupo="beneficio">-</button>
                    <span id="cantidad-${p.id}">0</span>
                    <button type="button" data-type="mas" data-id="${p.id}" data-grupo="beneficio">+</button>
                </div>
            </div>
        `;
    });

    // Muestra ambos paneles en columnas
    const panelEntradas = document.createElement('div');
    panelEntradas.appendChild(generalesDiv);
    panelEntradas.appendChild(beneficiosDiv);
    document.getElementById('info-container').appendChild(panelEntradas);

    // Función para habilitar/deshabilitar el botón continuar
    function actualizarBotonContinuarEntradas() {
        let totalSeleccionadas = 0;
        [...panelEntradas.querySelectorAll('span[id^="cantidad-"]')].forEach(span => {
            totalSeleccionadas += parseInt(span.textContent, 10);
        });
        btnContinuar.disabled = (totalSeleccionadas !== maxEntradas);
    }

    // Lógica para sumar/restar cantidad con máximo y con stock
    panelEntradas.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const type = e.target.getAttribute('data-type');
            const id = e.target.getAttribute('data-id');
            // Suma total de entradas seleccionadas
            let totalSeleccionadas = 0;
            [...panelEntradas.querySelectorAll('span[id^="cantidad-"]')].forEach(span => {
                totalSeleccionadas += parseInt(span.textContent, 10);
            });

            // Busca la promo seleccionada en ambas listas
            const promo = [...generales, ...beneficios].find(p => p.id == id);
            const span = document.getElementById('cantidad-' + id);
            let val = parseInt(span.textContent, 10);

            // Calcula el máximo permitido por stock y por asientos
            let maxPorPromo = maxEntradas;
            if (promo && promo.tieneStock && promo.stock !== null) {
                maxPorPromo = Math.min(maxEntradas, promo.stock);
            }

            // Calcula entradas seleccionadas en otras promos
            let totalSinEsta = totalSeleccionadas - val;
            let maxPorAsientos = maxEntradas - totalSinEsta;
            let maxReal = maxPorPromo;
            if (promo && promo.requierePuntos && socioData) {
                const puntosPorEntrada = promo.puntosNecesarios || 1;
                let maxPorPuntos = Math.floor(puntosSocio / puntosPorEntrada);
                maxReal = Math.min(maxPorPromo, maxPorPuntos, maxPorAsientos);
            } else {
                maxReal = Math.min(maxPorPromo, maxPorAsientos);
            }

            // Sumar/restar cantidad igual para todos
            if (type === 'mas') {
                if (val < maxReal) val++;
            }
            if (type === 'menos') {
                if (val > 0) val--;
            }
            span.textContent = val;

            // Visualización de puntos solo si requiere puntos
            if (promo && promo.requierePuntos && socioData) {
                const puntosPorEntrada = promo.puntosNecesarios || 1;
                let puntosUsados = val * puntosPorEntrada;
                let puntosRestantes = puntosSocio - puntosUsados;
                const puntosSpan = document.getElementById('puntos-disponibles-' + id);
                if (puntosSpan) {
                    puntosSpan.textContent = `Puntos disponibles: ${puntosRestantes}`;
                }
            }

            actualizarBotonContinuarEntradas();
        }
    });

    // Inicializa el botón al cargar
    actualizarBotonContinuarEntradas();
});
