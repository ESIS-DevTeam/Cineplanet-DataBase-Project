import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');
    const productos = params.get('productos');

    // Verifica sesión para mostrar el ícono de socio
    let sessionData = {};
    try {
        const sessionRes = await fetch('../../backend/auth/checkSession.php');
        sessionData = await sessionRes.json();
        const socioDisplay = document.getElementById('socio-display');
        if (sessionData.socio && sessionData.socio.nombre) {
            const nombre = sessionData.socio.nombre;
            const iniciales = nombre.split(' ').map(word => word[0]).join('').toUpperCase();
            socioDisplay.textContent = iniciales;
        } else {
            socioDisplay.textContent = '👤';
        }
    } catch (error) {
        document.getElementById('socio-display').textContent = '👤';
    }

    // Obtener datos de función y película
    let infoFuncion = null;
    if (idFuncion) {
        try {
            const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            infoFuncion = await resInfo.json();
        } catch {
            document.getElementById('info-container').textContent = 'Error al obtener la información de la función.';
        }
    }

    // Renderiza la info de función y película
    const infoContainer = document.getElementById('info-container');
    if (infoFuncion) {
        let fechaTexto = '';
        if (infoFuncion.fecha) {
            const fechaObj = new Date(infoFuncion.fecha + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaObj.getTime() === hoy.getTime()) {
                fechaTexto = `Hoy, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
            } else {
                const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                fechaTexto = `${diasSemana[fechaObj.getDay()]}, ${fechaObj.getDate()} de ${fechaObj.toLocaleString('es-ES', { month: 'short' })} de ${fechaObj.getFullYear()}`;
            }
        }
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
        infoContainer.appendChild(infoDiv);
    }

    // Mostrar resumen de compra y total
    // Crea el modal si no existe
    let resumenModal = document.getElementById('resumen-modal');
    if (!resumenModal) {
        resumenModal = document.createElement('div');
        resumenModal.id = 'resumen-modal';
        resumenModal.style.display = 'none';
        resumenModal.style.position = 'fixed';
        resumenModal.style.top = '0';
        resumenModal.style.left = '0';
        resumenModal.style.width = '100vw';
        resumenModal.style.height = '100vh';
        resumenModal.style.zIndex = '9999';
        resumenModal.style.background = 'rgba(0, 0, 0, 0.5)';
        resumenModal.style.backdropFilter = 'blur(2px)';
        resumenModal.innerHTML = `<div id="resumen-compra-container" style="background:#fff; max-width:500px; margin:5vh auto; border-radius:10px; padding:2em; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);"></div>`;
        document.body.appendChild(resumenModal);
    }
    const resumenContainer = document.getElementById('resumen-compra-container');

    // Crea el contenedor para el total y el botón
    let infoTotalContainer = document.getElementById('info-total-container');
    if (!infoTotalContainer) {
        infoTotalContainer = document.createElement('div');
        infoTotalContainer.id = 'info-total-container';
        infoContainer.parentNode.insertBefore(infoTotalContainer, infoContainer.nextSibling);
    }

    const resumenParams = new URLSearchParams();
    if (idFuncion) resumenParams.set('funcion', idFuncion);
    if (idPelicula) resumenParams.set('pelicula', idPelicula);
    if (asientos) resumenParams.set('asientos', asientos);
    if (promos) resumenParams.set('promos', promos);
    if (productos) resumenParams.set('productos', productos);

    try {
        const urlDeResumen = BASE_API_DOMAIN + 'getResumenCompra.php?' + resumenParams.toString();
        console.log("URL para obtener resumen:", urlDeResumen); // Log para ver la URL
        
        const res = await fetch(urlDeResumen);

        if (!res.ok) {
            // Si la respuesta no es exitosa (ej. 404, 500), muestra el estado
            throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
        }

        const resumen = await res.json();

        // Muestra el precio total y el botón
        infoTotalContainer.innerHTML = `
            <div>
                <div>
                    <strong>Total: S/${resumen.total.toFixed(2)}</strong>
                </div>
                <button id="btn-ver-resumen" type="button">Ver Resumen de compra</button>
            </div>
        `;

        // Renderiza el resumen para el modal
        let html = `<div>
            <div>
                <h2>Resumen de compra</h2>
                <button type="button" id="btn-cerrar-resumen">Cerrar</button>
            </div>
            <div>`;
        if (resumen.asientos && resumen.asientos.length > 0) {
            html += `<div><strong>Butacas Seleccionadas:</strong><br>${resumen.asientos.join(', ')} <span>Cant. ${resumen.asientos.length}</span></div>`;
        }
        if (resumen.entradas && resumen.entradas.length > 0) {
            html += `<div><strong>Entradas:</strong></div>`;
            resumen.entradas.forEach(e => {
                html += `<div>
                    ${e.nombre}${e.descripcion ? `<br><span>${e.descripcion}</span>` : ''}
                    <span>Cant. ${e.cantidad}</span>
                    <span>S/${e.precio.toFixed(2)}</span>
                </div>`;
            });
            html += `<div>Sub-Total S/${resumen.totalEntradas.toFixed(2)}</div>`;
        }
        if (resumen.dulceria && resumen.dulceria.length > 0) {
            html += `<div><strong>Dulcería:</strong></div>`;
            resumen.dulceria.forEach(d => {
                html += `<div>
                    ${d.nombre}${d.descripcion ? `<br><span>${d.descripcion}</span>` : ''}
                    <span>Cant. ${d.cantidad}</span>
                    <span>S/${d.precio.toFixed(2)}</span>
                </div>`;
            });
            html += `<div>Sub-Total S/${resumen.totalDulceria.toFixed(2)}</div>`;
        }
        html += `<hr>`;
        html += `<div>Precio Total: S/${resumen.total.toFixed(2)}</div>`;
        html += `</div></div>`;

        resumenContainer.innerHTML = html;

        // Mostrar/ocultar resumen en modal
        document.getElementById('btn-ver-resumen').onclick = () => {
            resumenModal.style.display = 'block';
        };
        resumenContainer.querySelector('#btn-cerrar-resumen').onclick = () => {
            resumenModal.style.display = 'none';
        };
    } catch (error) {
        console.error("Error al cargar el resumen de compra:", error); // Log para ver el error exacto
        infoTotalContainer.innerHTML = '<div>Error al cargar el resumen de compra. Revisa la consola para más detalles.</div>';
    }

    // Aquí irá la lógica para mostrar el resumen de la compra y el formulario de pago

    // Rellenar y deshabilitar campos si el usuario está logueado
    if (sessionData.socio) {
        const form = document.getElementById('form-pago');
        // Nombre
        if (form.nombre) {
            form.nombre.value = sessionData.socio.nombre || '';
            form.nombre.readOnly = true;
        }
        // Email
        if (form.correo) {
            form.correo.value = sessionData.socio.email || '';
            form.correo.readOnly = true;
        }
        // DNI
        const tipoDocumento = (sessionData.socio.tipoDocumento || '').toUpperCase();
        const numeroDocumento = sessionData.socio.numeroDocumento || '';
        // Tarjeta
        if (form['num-doc-tarjeta']) {
            form['num-doc-tarjeta'].value = numeroDocumento;
            form['num-doc-tarjeta'].readOnly = true;
        }
        if (form['tipo-doc-tarjeta']) {
            form['tipo-doc-tarjeta'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-tarjeta'].disabled = true;
        }
        // Agora
        if (form['num-doc-agora']) {
            form['num-doc-agora'].value = numeroDocumento;
            form['num-doc-agora'].readOnly = true;
        }
        if (form['tipo-doc-agora']) {
            form['tipo-doc-agora'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-agora'].disabled = true;
        }
        // Billetera
        if (form['num-doc-billetera']) {
            form['num-doc-billetera'].value = numeroDocumento;
            form['num-doc-billetera'].readOnly = true;
        }
        if (form['tipo-doc-billetera']) {
            form['tipo-doc-billetera'].value = tipoDocumento === 'DNI' ? 'dni' : '';
            form['tipo-doc-billetera'].disabled = true;
        }
        // Celular
        const celular = sessionData.socio.celular || '';
        if (form['celular-agora']) {
            form['celular-agora'].value = celular;
            form['celular-agora'].readOnly = true;
        }
        if (form['celular-billetera']) {
            form['celular-billetera'].value = celular;
            form['celular-billetera'].readOnly = true;
        }
    }

    // --- NUEVO: Lógica de verificación de documento y pago ---
    const form = document.getElementById('form-pago');

    // Modal para errores
    function mostrarModalError(mensaje, onAceptar) {
        let modal = document.getElementById('modal-error');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-error';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.45)';
            modal.style.zIndex = '99999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `
                <div style="background:#fff; padding:2em; border-radius:10px; box-shadow:0 4px 20px #0002; max-width:350px; text-align:center;">
                    <div id="modal-error-msg" style="margin-bottom:1em; font-size:1.1em;"></div>
                    <button id="modal-error-aceptar" style="padding:0.5em 2em;">Aceptar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.querySelector('#modal-error-msg').textContent = mensaje;
        modal.style.display = 'flex';
        const btnAceptar = modal.querySelector('#modal-error-aceptar');
        btnAceptar.onclick = () => {
            modal.style.display = 'none';
            if (typeof onAceptar === 'function') onAceptar();
        };
    }

    // Loader modal
    function mostrarLoader() {
        let loader = document.getElementById('modal-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'modal-loader';
            loader.style.position = 'fixed';
            loader.style.top = '0';
            loader.style.left = '0';
            loader.style.width = '100vw';
            loader.style.height = '100vh';
            loader.style.background = 'rgba(0,0,0,0.45)';
            loader.style.zIndex = '99999';
            loader.style.display = 'flex';
            loader.style.alignItems = 'center';
            loader.style.justifyContent = 'center';
            loader.innerHTML = `
                <div style="background:#fff; padding:2em; border-radius:10px; box-shadow:0 4px 20px #0002; text-align:center;">
                    <div style="margin-bottom:1em;">
                        <span style="font-size:2em;">⏳</span>
                    </div>
                    <div>Procesando pago...</div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    function ocultarLoader() {
        const loader = document.getElementById('modal-loader');
        if (loader) loader.style.display = 'none';
    }

    // Modal de éxito
    function mostrarModalExito(idBoleta) {
        let modal = document.getElementById('modal-exito');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-exito';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.45)';
            modal.style.zIndex = '99999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `
                <div style="background:#fff; padding:2em; border-radius:10px; box-shadow:0 4px 20px #0002; max-width:350px; text-align:center;">
                    <div style="margin-bottom:1em; font-size:1.3em;">✅ Pago exitoso</div>
                    <div id="modal-exito-msg" style="margin-bottom:1em; font-size:1.1em;"></div>
                    <button id="modal-exito-aceptar" style="padding:0.5em 2em;">Aceptar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.querySelector('#modal-exito-msg').textContent = `ID de boleta: ${idBoleta}`;
        modal.style.display = 'flex';
        const btnAceptar = modal.querySelector('#modal-exito-aceptar');
        btnAceptar.onclick = () => {
            modal.style.display = 'none';
            window.location.href = '../../index.html';
        };
    }

    async function procesarPago(idUsuario) {
        if (!idUsuario) {
            mostrarModalError('Error: No se pudo obtener un ID de usuario para la boleta.');
            return;
        }
        datosBoleta.idUsuario = idUsuario;

        const payload = {
            ...datosBoleta,
            idFuncion: idFuncion,
            productosBoleta: datosProductosBoleta,
            promosBoleta: datosPromoBoleta,
            asientosBoleta: datosBoletaAsiento
        };

        mostrarLoader();

        try {
            const res = await fetch(`${BASE_API_DOMAIN}realizarPago.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resultadoPago = await res.json();

            ocultarLoader();

            if (resultadoPago.success) {
                mostrarModalExito(resultadoPago.idBoleta);
            } else {
                // Manejo de error de asiento ocupado (violación UNIQUE)
                if (
                    resultadoPago.message &&
                    resultadoPago.message.toLowerCase().includes('duplicate entry') &&
                    resultadoPago.message.toLowerCase().includes('uq_funcion_asiento')
                ) {
                    mostrarModalError(
                        'Uno o más asientos ya están ocupados. Por favor, selecciona otros asientos.',
                        () => window.location.href = `peliculaSeleccion.html?pelicula=${idPelicula}`
                    );
                } else {
                    mostrarModalError(`Error en el pago: ${resultadoPago.message}`);
                }
            }
        } catch (err) {
            ocultarLoader();
            mostrarModalError('Error al conectar con el servidor para realizar el pago.');
        }
    }

    // Detectar todos los botones de pago
    form.querySelectorAll('button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault(); // Evita el submit normal

            // Si está logueado, usar el id del socio
            if (sessionData.socio && sessionData.socio.id) {
                await procesarPago(sessionData.socio.id);
                return;
            }

            // Detectar método de pago
            const metodo = btn.getAttribute('data-metodo');
            let tipoDocumento = '', numeroDocumento = '', nombreCompleto = '', correoElectronico = '';

            nombreCompleto = form.nombre.value.trim();
            correoElectronico = form.correo.value.trim();

            if (metodo === 'tarjeta') {
                tipoDocumento = form['tipo-doc-tarjeta'].value;
                numeroDocumento = form['num-doc-tarjeta'].value.trim();
            } else if (metodo === 'agora') {
                tipoDocumento = form['tipo-doc-agora'].value;
                numeroDocumento = form['num-doc-agora'].value.trim();
            } else if (metodo === 'billetera') {
                tipoDocumento = form['tipo-doc-billetera'].value;
                numeroDocumento = form['num-doc-billetera'].value.trim();
            }

            // Validar campos mínimos
            if (!tipoDocumento || !numeroDocumento || !nombreCompleto || !correoElectronico) {
                alert('Completa todos los campos requeridos.');
                return;
            }

            // Consultar al backend para verificar/registrar usuario
            try {
                const res = await fetch(`${BASE_API_DOMAIN}verificarDocumento.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipoDocumento,
                        numeroDocumento,
                        nombreCompleto,
                        correoElectronico
                    })
                });
                const data = await res.json();

                if (data.status === 'socio') {
                    alert(data.message);
                } else if (data.status === 'usuario' || data.status === 'insertado') {
                    await procesarPago(data.idUsuario);
                } else {
                    alert(data.message || 'Error desconocido al verificar documento.');
                }
            } catch (err) {
                alert('Error al verificar el documento. Intenta nuevamente.');
            }
        });
    });

    // --- NUEVO: Preparar datos para cada tabla relacionada con la boleta ---
    function parseCSV(str) {
        return str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    function parseProductos(str) {
        return str ? str.split(',').map(item => {
            const [id, cantidad] = item.split('-');
            return {
                idProducto: id,
                cantidad: cantidad ? parseInt(cantidad, 10) : 1,
                precioUnitario: null,
                subtotal: null
            };
        }).filter(p => p.idProducto) : [];
    }

    function parsePromos(str) {
        return str ? str.split(',').map(item => {
            const [id] = item.split(':');
            return {
                idPromo: id,
                montoDescuento: null,
                detalle: ''
            };
        }).filter(p => p.idPromo) : [];
    }

    const datosBoleta = {
        idUsuario: null,
        fecha: new Date().toISOString().slice(0, 10),
        subtotal: 0,
        descuentoTotal: 0,
        total: 0
    };

    const datosBoletaAsiento = parseCSV(asientos).map(asiento => ({
        idFuncion: idFuncion,
        idPlanoSala: asiento,
        precioUnitario: null
    }));

    const datosProductosBoleta = parseProductos(productos);
    const datosPromoBoleta = parsePromos(promos);

    async function completarPreciosProductos(arr) {
        for (const prod of arr) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getProductoDetallePrecio.php?idProducto=${prod.idProducto}`);
                const data = await res.json();
                prod.precioUnitario = data.precioUnitario ?? null;
                prod.subtotal = prod.precioUnitario !== null ? prod.precioUnitario * prod.cantidad : null;
            } catch {
                prod.precioUnitario = null;
                prod.subtotal = null;
            }
        }
    }

    async function completarDatosPromos(arr, idFuncion) {
        for (const promo of arr) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getPromoDetalleDescuento.php?idPromo=${promo.idPromo}&idFuncion=${idFuncion}`);
                const data = await res.json();
                promo.montoDescuento = data.montoDescuento ?? null;
                promo.detalle = data.detalle ?? '';
                promo.precioFinal = data.precioFinal ?? null; // Guardar el precio final
                promo.tipo = data.tipo ?? 'fijo'; // Guardar el tipo
            } catch {
                promo.montoDescuento = null;
                promo.detalle = '';
                promo.precioFinal = null;
                promo.tipo = 'fijo';
            }
        }
    }

    // --- NUEVO: Obtener precio de función y aplicar descuento de promo a cada asiento ---
    async function completarPreciosAsientos(asientosArr, promosArr, idFuncion) {
        if (asientosArr.length === 0 || !idFuncion) return;

        let precioBase = null;
        try {
            const res = await fetch(`${BASE_API_DOMAIN}getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            const data = await res.json();
            precioBase = data.precio ?? null;
        } catch {
            precioBase = null;
        }

        if (precioBase === null) {
            asientosArr.forEach(asiento => asiento.precioUnitario = null);
            return;
        }

        asientosArr.forEach((asiento, index) => {
            const promo = promosArr.length > 0 ? (promosArr[index] ?? promosArr[0]) : null;
            
            if (promo && promo.precioFinal !== null) {
                asiento.precioUnitario = promo.precioFinal;
            } else {
                asiento.precioUnitario = precioBase;
            }
        });

        return precioBase; // Devuelve el precio base para el cálculo del subtotal
    }

    (async () => {
        await completarPreciosProductos(datosProductosBoleta);
        await completarDatosPromos(datosPromoBoleta, idFuncion);
        const precioBaseAsiento = await completarPreciosAsientos(datosBoletaAsiento, datosPromoBoleta, idFuncion);

        // --- CORREGIDO: Calcular totales para la boleta ---
        const subtotalAsientos = (precioBaseAsiento || 0) * datosBoletaAsiento.length;
        const subtotalProductos = datosProductosBoleta.reduce((acc, prod) => acc + (prod.subtotal || 0), 0);
        datosBoleta.subtotal = subtotalAsientos + subtotalProductos;

        // El descuento total es la suma de los descuentos aplicados a cada asiento.
        const totalAsientosConDescuento = datosBoletaAsiento.reduce((acc, asiento) => acc + (asiento.precioUnitario || 0), 0);
        datosBoleta.descuentoTotal = subtotalAsientos - totalAsientosConDescuento;
        
        datosBoleta.total = datosBoleta.subtotal - datosBoleta.descuentoTotal;
    })();
});
