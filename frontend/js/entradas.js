import BASE_API_DOMAIN from "./config.js";

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
        const loginModal = document.getElementById('login-modal');
        const loginFrame = document.getElementById('login-frame');
        params.set('redirect', window.location.pathname + '?' + params.toString());
        params.set('fromEntradas', '1');
        loginFrame.src = `login.html?${params.toString()}`;
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        return;
    } else {
        // Asegura que el contenido principal esté visible si no hay modal
        document.getElementById('main-content').classList.remove('oculto-por-modal');
        document.getElementById('login-modal').style.display = 'none';
        document.body.style.overflow = '';
    }

    const socioData = sessionData.socio || null;
    let esEmpleado = socioData && socioData.empleado == 1;
    let puntosSocio = 0;

    // NUEVO: función para obtener puntos del socio desde endpoint
    async function obtenerPuntosSocio(idSocio) {
        if (!idSocio) return 0;
        try {
            const res = await fetch(BASE_API_DOMAIN + `getPuntosSocio.php?idSocio=${idSocio}`);
            const data = await res.json();
            if (data && typeof data.puntos === 'number') {
                return data.puntos;
            }
        } catch {}
        return 0;
    }

    // Extrae parámetros de la URL
    if (!idFuncion) {
        document.getElementById('info-container').textContent = 'No se ha seleccionado función.';
        return;
    }

    // Obtener datos completos de la función y película
    let infoFuncion = null;
    try {
        const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
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
            fechaTexto = `Hoy, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })}, ${fechaObj.getFullYear()}`;
        } else {
            const diasSemana = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
            fechaTexto = `${diasSemana[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })}, ${fechaObj.getFullYear()}`;
        }
    }

    // Clasificación (R) si existe
    let clasificacionHtml = '';
    if (infoFuncion && infoFuncion.clasificacion) {
        clasificacionHtml = `<span class="clasificacion">(${infoFuncion.clasificacion})</span>`;
    }

    // Formato, idioma, subtitulado
    let formatoLinea = '';
    if (infoFuncion) {
        formatoLinea = `${clasificacionHtml}${infoFuncion.formato || ''}`;
        if (infoFuncion.formato && infoFuncion.tipoFuncion) {
            formatoLinea += `, ${infoFuncion.tipoFuncion}`;
        }
        if (infoFuncion.idioma) {
            formatoLinea += `, ${infoFuncion.idioma}`;
        }
    }

    // Portada: usa siempre la ruta ../images/portrait/movie/${infoFuncion.portada}
    let portadaSrc = '';
    if (infoFuncion.portada) {
        portadaSrc = `../images/portrait/movie/${infoFuncion.portada}`;
    }

    // Muestra la información igual que en asientos.js (diseño alineado)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-funcion-card';
    infoDiv.innerHTML = `
        ${portadaSrc ? `<img src="${portadaSrc}" alt="Portada" class="portada-circular">` : ''}
        <h2 class="titulo-pelicula">${infoFuncion.nombrePelicula || ''}</h2>
        <div class="formato-linea">${formatoLinea}</div>
        <div class="cine-nombre">${infoFuncion.nombreCine || ''}</div>
        <ul class="info-lista">
            <li><span class="icono"><i class="fa-regular fa-calendar"></i></span>${fechaTexto}</li>
            <li><span class="icono"><i class="fa-regular fa-clock"></i></span>${infoFuncion.hora || ''}</li>
            <li><span class="icono"><i class="fa-solid fa-chair"></i></span>${infoFuncion.nombreSala || ''}</li>
        </ul>
        <hr>
    `;
    document.getElementById('info-container').innerHTML = '';
    document.getElementById('info-container').appendChild(infoDiv);

    // Panel principal de selección de entradas (diseño según imagen)
    const panelEntradasContainer = document.getElementById('panel-entradas-container');
    panelEntradasContainer.innerHTML = `
        <div class="panel-entradas-header">
            <div class="panel-entradas-titulo-grande">Selecciona tus entradas</div>
            <div class="panel-entradas-subtitulo">
                ¡Combínalas como prefieras! Recuerda que deben coincidir con el número de butacas que seleccionaste.
            </div>
        </div>
        <div class="panel-entradas-flex"></div>
        <div class="panel-entradas-pie">
            <div class="panel-codigos">
                <span class="panel-codigos-label">Canjea tus códigos</span>
                <input class="panel-codigos-input" type="text" placeholder="Ingresa tu código" disabled>
                <button class="panel-codigos-btn" disabled>Canjear</button>
                <div class="panel-codigos-desc">Códigos promocionales, entradas corporativas.</div>
            </div>
            <div class="panel-resumen">
                Entradas seleccionadas: <span id="panel-resumen-cantidad">0</span> de ${maxEntradas}
            </div>
        </div>
    `;

    // Mostrar las entradas usando solo promociones
    let promos = [];
    let precioBase = 0;
    try {
        const res = await fetch(BASE_API_DOMAIN + `getPromosEntradas.php?idFuncion=${idFuncion}${esInvitado ? '' : '&socio=1'}`);
        const data = await res.json();
        promos = data.promos || [];
        precioBase = data.precioBase || 0;
    } catch {
        document.getElementById('info-container').innerHTML += '<div>Error al obtener las promociones.</div>';
        return;
    }

    // NUEVO: obtener puntos del socio antes de renderizar beneficios
    if (socioData && socioData.id) {
        puntosSocio = await obtenerPuntosSocio(socioData.id);
    }

    // NUEVO: obtener el stock disponible por usuario para cada promo con stock
    async function obtenerStockPromoUsuario(promo, idUsuario) {
        if (!promo.tieneStock || promo.stock === null) return promo.stock;
        // Si no hay usuario, retorna el stock general
        if (!idUsuario) return promo.stock;
        try {
            const res = await fetch(BASE_API_DOMAIN + `getPromoStockUsuario.php?idPromo=${promo.id}&idUsuario=${idUsuario}`);
            const data = await res.json();
            if (data && typeof data.stockDisponible === 'number') {
                return data.stockDisponible;
            }
        } catch {}
        return promo.stock;
    }

    // --- Mueve este bloque antes de renderizar las columnas ---
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

    // Renderiza las entradas generales y beneficios en columnas tipo tarjetas
    const panelFlex = panelEntradasContainer.querySelector('.panel-entradas-flex');

    // Columna de generales
    const generalesDiv = document.createElement('div');
    generalesDiv.className = 'panel-entradas-col panel-entradas-generales';
    generalesDiv.innerHTML = `<div class="panel-entradas-titulo">Entradas generales</div>`;
    generales.forEach(p => {
        let stockInfo = '';
        if (p.tieneStock && p.stock !== null) {
            stockInfo = `<span class="stock-info">Stock disponible: ${p.stock}</span>`;
        }
        generalesDiv.innerHTML += `
            <div class="panel-entrada-item">
                <div class="panel-entrada-info">
                    <div class="panel-entrada-nombre">${p.nombre}</div>
                    <div class="panel-entrada-desc">${p.descripcion || ''}</div>
                    <div class="panel-entrada-precio">
                        S/${p.precioFinal.toFixed(2)}
                        ${p.precioFinal < precioBase ? '<span class="panel-entrada-precio-bajo">Precio más bajo</span>' : ''}
                    </div>
                </div>
                <div class="panel-entrada-controles">
                    <button type="button" class="entrada-circulo-btn" data-type="menos" data-id="${p.id}" data-grupo="general" aria-label="Restar" disabled><i class="fa-solid fa-minus"></i></button>
                    <span id="cantidad-${p.id}" class="panel-entrada-cantidad">0</span>
                    <button type="button" class="entrada-circulo-btn" data-type="mas" data-id="${p.id}" data-grupo="general" aria-label="Sumar"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        `;
    });

    // Columna de beneficios
    const beneficiosDiv = document.createElement('div');
    beneficiosDiv.className = 'panel-entradas-col panel-entradas-beneficios';
    beneficiosDiv.innerHTML = `<div class="panel-entradas-titulo">Tus Beneficios</div>`;
    beneficios.forEach(p => {
        let stockInfo = '';
        if (p.tieneStock && p.stock !== null) {
            stockInfo = `<span class="stock-info">Stock disponible: ${p.stock}</span>`;
        }
        beneficiosDiv.innerHTML += `
            <div class="panel-entrada-item">
                <div class="panel-entrada-info">
                    <div class="panel-entrada-nombre">${p.nombre}</div>
                    <div class="panel-entrada-desc">${p.descripcion || ''}</div>
                    ${p.requierePuntos && socioData ? `<div class="panel-entrada-puntos" id="puntos-disponibles-${p.id}">Puntos disponibles: ${puntosSocio}</div>` : ''}
                    <div class="panel-entrada-precio">
                        S/${p.precioFinal.toFixed(2)}
                    </div>
                </div>
                <div class="panel-entrada-controles">
                    <button type="button" class="entrada-circulo-btn" data-type="menos" data-id="${p.id}" data-grupo="beneficio" aria-label="Restar" disabled><i class="fa-solid fa-minus"></i></button>
                    <span id="cantidad-${p.id}" class="panel-entrada-cantidad">0</span>
                    <button type="button" class="entrada-circulo-btn" data-type="mas" data-id="${p.id}" data-grupo="beneficio" aria-label="Sumar"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        `;
    });

    panelFlex.appendChild(generalesDiv);
    panelFlex.appendChild(beneficiosDiv);

    // --- Botón continuar dinámico ---
    const btnContinuar = document.createElement('button');
    btnContinuar.id = 'btn-continuar';
    btnContinuar.className = 'btn-continuar';
    btnContinuar.textContent = 'Continuar';
    btnContinuar.disabled = true;
    // Inserta el botón después del panel de selección
    panelEntradasContainer.appendChild(btnContinuar);

    // Función para habilitar/deshabilitar el botón continuar
    function actualizarBotonContinuarEntradas() {
        let totalSeleccionadas = 0;
        [...panelFlex.querySelectorAll('span[id^="cantidad-"]')].forEach(span => {
            totalSeleccionadas += parseInt(span.textContent, 10);
        });
        btnContinuar.disabled = (totalSeleccionadas !== maxEntradas);
        // Actualiza el resumen
        document.getElementById('panel-resumen-cantidad').textContent = totalSeleccionadas;
    }

    // Lógica para sumar/restar cantidad con máximo y con stock
    panelFlex.addEventListener('click', function(e) {
        if (e.target.closest('button.entrada-circulo-btn')) {
            const btn = e.target.closest('button.entrada-circulo-btn');
            const type = btn.getAttribute('data-type');
            const id = btn.getAttribute('data-id');
            // Suma total de entradas seleccionadas
            let totalSeleccionadas = 0;
            [...panelFlex.querySelectorAll('span[id^="cantidad-"]')].forEach(span => {
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

            // Habilita/deshabilita los botones según el valor
            const menosBtn = btn.parentElement.querySelector('button[data-type="menos"]');
            const masBtn = btn.parentElement.querySelector('button[data-type="mas"]');
            menosBtn.disabled = (parseInt(span.textContent, 10) === 0);
            masBtn.disabled = (parseInt(span.textContent, 10) >= maxReal);

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

    // Inicializa los botones menos como deshabilitados
    panelFlex.querySelectorAll('.panel-entrada-controles').forEach(controles => {
        const menosBtn = controles.querySelector('button[data-type="menos"]');
        menosBtn.disabled = true;
    });

    // Evento click para continuar (después de renderizar todo)
    btnContinuar.addEventListener('click', () => {
        // Obtiene los asientos seleccionados de la URL
        const asientos = params.get('asientos') || '';
        // Obtiene las promociones y cantidades seleccionadas
        const promosSeleccionadas = [];
        [...panelFlex.querySelectorAll('span[id^="cantidad-"]')].forEach(span => {
            const cantidad = parseInt(span.textContent, 10);
            if (cantidad > 0) {
                const idPromo = span.id.replace('cantidad-', '');
                promosSeleccionadas.push({ id: idPromo, cantidad });
            }
        });
        // Serializa las promociones seleccionadas en la URL
        // Ejemplo: promos=1:2,3:1 (idPromo:cantidad)
        const promosParam = promosSeleccionadas.map(p => `${p.id}:${p.cantidad}`).join(',');
        const urlParams = new URLSearchParams();
        urlParams.set('pelicula', idPelicula);
        urlParams.set('funcion', idFuncion);
        urlParams.set('asientos', asientos);
        if (promosParam) urlParams.set('promos', promosParam);
        if (params.get('invitado') === '1') urlParams.set('invitado', '1');
        window.location.href = `dulceria.html?${urlParams.toString()}`;
    });

    // Inicializa el botón al cargar
    actualizarBotonContinuarEntradas();
});
