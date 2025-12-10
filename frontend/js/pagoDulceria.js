import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productos = params.get('productos');
    const idCiudad = params.get('ciudad');
    const idCine = params.get('cine');
    const idPelicula = params.get('pelicula');

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

    // Renderiza solo la info del cine si hay ciudad y cine
    const infoContainer = document.getElementById('info-container');
    if (idCiudad && idCine) {
        try {
            const res = await fetch(BASE_API_DOMAIN + `getInfoCine.php?idCine=${idCine}`);
            const cine = await res.json();
            infoContainer.innerHTML = `
                ${cine.imagen ? `<img src="../images/portrait/cines/${cine.imagen}" alt="Foto cine" class="portada-circular">` : ''}
                <h2 class="titulo-pelicula">${cine.nombre || ''}</h2>
                <div class="cine-nombre">${cine.direccion || ''}</div>
                <hr>
            `;
        } catch {
            infoContainer.textContent = 'No se pudo cargar la información del cine.';
        }
    }

    // Renderiza la info y resumen de dulcería
    async function getNombreProducto(idProducto) {
        try {
            const res = await fetch(`${BASE_API_DOMAIN}getProductoNombre.php?idProducto=${idProducto}`);
            const data = await res.json();
            return data.nombre;
        } catch {
            return "";
        }
    }

    async function parseProductos(str) {
        if (!str) return [];
        const arr = str.split(',').map(item => {
            const [id, cantidad] = item.split('-');
            return {
                idProducto: id,
                cantidad: cantidad ? parseInt(cantidad, 10) : 1,
                precioUnitario: null,
                subtotal: null,
                nombre: null
            };
        }).filter(p => p.idProducto);
        for (const p of arr) {
            const nombreProducto = await getNombreProducto(p.idProducto);
            p.nombre = nombreProducto;
        }
        return arr;
    }
    const productosArr = await parseProductos(productos);

    // Obtén precios y muestra resumen
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

    await completarPreciosProductos(productosArr);

    // Calcula totales
    const subtotal = productosArr.reduce((acc, prod) => acc + (prod.subtotal || 0), 0);
    const total = subtotal;

    // Agrega la clase CSS global para ocultar el scrollbar si no existe
    if (!document.getElementById('hide-scrollbar-style')) {
        const style = document.createElement('style');
        style.id = 'hide-scrollbar-style';
        style.innerHTML = `
            .hide-scrollbar {
                scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Renderiza resumen
    let resumenModalBg = document.getElementById('resumen-modal-bg');
    let resumenModalContent = document.getElementById('resumen-modal-content');
    if (!resumenModalBg) {
        resumenModalBg = document.createElement('div');
        resumenModalBg.id = 'resumen-modal-bg';
        resumenModalBg.innerHTML = `<div class="resumen-modal" id="resumen-modal-content"></div>`;
        document.body.appendChild(resumenModalBg);
        resumenModalContent = resumenModalBg.querySelector('#resumen-modal-content');
    }

    // Crea el contenedor para el total y el botón
    let infoTotalContainer = document.getElementById('info-total-container');
    if (!infoTotalContainer) {
        infoTotalContainer = document.createElement('div');
        infoTotalContainer.id = 'info-total-container';
        infoContainer.parentNode.insertBefore(infoTotalContainer, infoContainer.nextSibling);
    }

    infoTotalContainer.innerHTML = `
        <div>
            <div class="resumen-total">
                Total: S/${total.toFixed(2)}
            </div>
            <button id="btn-ver-resumen" type="button" class="btn-ver-resumen">Ver Resumen de compra</button>
        </div>
    `;

    function renderResumenHtml() {
        let dulceriaHtml = '';
        if (productosArr.length > 0) {
            dulceriaHtml = `
                <div style="margin-bottom:1em;">
                    <span style="font-weight:700; color:#0d3c6e;">Dulcería:</span>
                    ${productosArr.map(d => `
                        <div class="detalle-entrada">
                            <div class="detalle-info">
                                ${d.nombre}
                            </div>
                            <div style="text-align:right;">
                                <span class="cant">Cant. ${d.cantidad}</span>
                                <span class="precio">S/${d.subtotal?.toFixed(2) ?? '0.00'}</span>
                            </div>
                        </div>
                    `).join('')}
                    <div class="subtotal" style="margin-top:1em;">Sub-Total <span class="precio">S/${total.toFixed(2)}</span></div>
                </div>
            `;
        }
        let footerHtml = `
            <div class="resumen-footer">
                <span class="precio-total">Precio Total: S/${total.toFixed(2)}</span>
            </div>
        `;
        return `
            <div class="resumen-header">
                <span class="resumen-titulo">Resumen de compra</span>
                <button class="cerrar-resumen-btn" id="cerrar-resumen-btn">Cerrar</button>
            </div>
            <div class="resumen-body">
                ${dulceriaHtml}
            </div>
            ${footerHtml}
        `;
    }

    // Mostrar/ocultar resumen en modal
    document.getElementById('btn-ver-resumen').onclick = () => {
        resumenModalContent.innerHTML = renderResumenHtml();
        resumenModalBg.classList.add('active');
        resumenModalContent.querySelector('#cerrar-resumen-btn').onclick = () => {
            resumenModalBg.classList.remove('active');
        };
        resumenModalBg.onclick = (e) => {
            if (e.target === resumenModalBg) resumenModalBg.classList.remove('active');
        };
    };

    // Formulario de pago
    const form = document.getElementById('form-pago');

    // Rellenar y deshabilitar campos si el usuario está logueado
    if (sessionData.socio) {
        const form = document.getElementById('form-pago');
        if (form.nombre) { form.nombre.value = sessionData.socio.nombre || ''; form.nombre.readOnly = true; }
        if (form.correo) { form.correo.value = sessionData.socio.email || ''; form.correo.readOnly = true; }
        const tipoDocumento = (sessionData.socio.tipoDocumento || '').toUpperCase();
        const numeroDocumento = sessionData.socio.numeroDocumento || '';
        if (form['num-doc-tarjeta']) { form['num-doc-tarjeta'].value = numeroDocumento; form['num-doc-tarjeta'].readOnly = true; }
        if (form['tipo-doc-tarjeta']) { form['tipo-doc-tarjeta'].value = tipoDocumento === 'DNI' ? 'dni' : ''; form['tipo-doc-tarjeta'].disabled = true; }
        if (form['num-doc-agora']) { form['num-doc-agora'].value = numeroDocumento; form['num-doc-agora'].readOnly = true; }
        if (form['tipo-doc-agora']) { form['tipo-doc-agora'].value = tipoDocumento === 'DNI' ? 'dni' : ''; form['tipo-doc-agora'].disabled = true; }
        if (form['num-doc-billetera']) { form['num-doc-billetera'].value = numeroDocumento; form['num-doc-billetera'].readOnly = true; }
        if (form['tipo-doc-billetera']) { form['tipo-doc-billetera'].value = tipoDocumento === 'DNI' ? 'dni' : ''; form['tipo-doc-billetera'].disabled = true; }
        const celular = sessionData.socio.celular || '';
        if (form['celular-agora']) { form['celular-agora'].value = celular; form['celular-agora'].readOnly = true; }
        if (form['celular-billetera']) { form['celular-billetera'].value = celular; form['celular-billetera'].readOnly = true; }
    }

    // Modal de error y éxito
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
    async function mostrarModalExito(idBoleta) {
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
            modal.innerHTML = `<div id="modal-exito-content" class="hide-scrollbar" style="background:#fff; max-width:700px; max-height:80vh; overflow:auto; margin:5vh auto; border-radius:16px; padding:40px 40px 28px 40px; position:relative; box-shadow:0 4px 20px #0002;"></div>`;
            document.body.appendChild(modal);
        }

        const nombreCliente = sessionData.socio?.nombre || '';
        function getFechaPeru() {
            const now = new Date();
            const peruOffset = -5 * 60;
            const localOffset = now.getTimezoneOffset();
            const diff = peruOffset - localOffset;
            const peruDate = new Date(now.getTime() + diff * 60000);
            return peruDate.toISOString().slice(0, 10);
        }
        const fechaCompra = getFechaPeru();

        let ciudadNombre = '';
        if (idCiudad) {
            try {
                const res = await fetch(`${BASE_API_DOMAIN}getCiudades.php`);
                const ciudades = await res.json();
                const ciudadObj = ciudades.find(c => String(c.id) === String(idCiudad));
                ciudadNombre = ciudadObj ? ciudadObj.nombre : '';
            } catch {
                ciudadNombre = '';
            }
        }
        const cineNombre = infoContainer.querySelector('h2')?.textContent || 'Cineplanet';

        const qrUrl = `ID:${idBoleta}`;
        let qrDatosHtml = `
        <div style="display:flex;align-items:center;justify-content:center;gap:2.5em;">
            <div style="flex-shrink:0;">
                <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}" alt="QR" style="width:140px;height:140px;display:block;border-radius:12px;">
            </div>
            <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;min-width:340px;display:flex;flex-direction:column;gap:1em;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128100;</span>
                        <span style="font-weight:500;color:#1565c0;">${nombreCliente}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#127963;</span>
                        <span style="color:#1565c0;">${ciudadNombre}</span>
                    </span>
                </div>
                <div style="border-top:1px dashed #1565c0;margin:0.5em 0;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#128197;</span>
                        <span style="color:#1565c0;">${fechaCompra}</span>
                    </span>
                    <span style="display:flex;align-items:center;gap:0.6em;">
                        <span style="font-size:1.2em;color:#1565c0;">&#127909;</span>
                        <span style="color:#1565c0;">${cineNombre}</span>
                    </span>
                </div>
            </div>
        </div>
        `;

        let mensajeQRHtml = `
        <div style="color:#d32f2f;font-size:1em;margin:1.5em 0 1.5em 0;text-align:center;">
            <span style="display:inline-block;">
                <span style="font-size:1.3em;vertical-align:middle;">&#128241;</span>
                Muestra el código QR desde tu celular para canjear tus productos. No necesitas imprimir este documento.
            </span>
        </div>
        `;

        let productosHtml = `
        <div style="border:2px solid #1565c0;border-radius:12px;padding:1.2em 2em;margin-bottom:1.5em;">
            <div style="background:#f5f6fa;border-radius:8px 8px 0 0;padding:0.7em 1em;display:flex;align-items:center;gap:0.7em;">
                <span style="font-size:1.5em;color:#1565c0;">&#127849;</span>
                <span style="font-weight:600;color:#1565c0;font-size:1.15em;">Productos</span>
            </div>
            <div style="padding:1em 0.5em;">
                ${productosArr.map(p => `
                    <div style="display:flex;align-items:center;justify-content:space-between;font-weight:500;color:#1565c0;">
                        <span>${p.nombre}</span>
                        <span>S/${p.precioUnitario}</span>
                        <span>S/${p.subtotal?.toFixed(2) ?? '0.00'}</span>
                    </div>
                `).join('')}
            </div>
            <div style="border-top:1px dashed #1565c0;margin:0.7em 0;"></div>
            <div style="text-align:right;font-weight:700;font-size:1.2em;color:#1565c0;padding-right:0.5em;">
                Sub Total: S/${total.toFixed(2)}
            </div>
        </div>
        `;

        let costoTotalHtml = `
        <div style="background:#192040;border-radius:8px;padding:1.2em 2em;display:flex;justify-content:space-between;align-items:center;margin-top:1.2em;">
            <span style="color:#fff;font-weight:600;font-size:1.15em;">Costo Total</span>
            <span style="color:#fff;font-weight:600;font-size:1.15em;">S/${total.toFixed(2)}</span>
        </div>
        `;

        let resumenHtml = `
        <div style="background:#fff;max-width:700px;margin:0 auto;display:flex;flex-direction:column;align-items:center;">
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color:#222; width:100%;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <img src="../images/items/logo3.png" alt="cineplanet" style="height:40px;">
                    <div style="background:#223a5f;color:#fff;padding:0.5em 1.2em;border-radius:8px;font-weight:bold;font-size:1.1em;">
                        Nro. de Compra: ${idBoleta}
                    </div>
                </div>
                <h1 style="text-align:center; margin:1em 0 0.5em 0; font-size:2em; font-weight:700;">
                    Dulcería
                </h1>
                ${qrDatosHtml}
                ${mensajeQRHtml}
                ${productosHtml}
                ${costoTotalHtml}
            </div>
        </div>
        `;

        let botonesHtml = `
            <div style="text-align:center; margin-top:1.5em; display:flex; justify-content:center; gap:1em;">
                <button id="btn-descargar-pdf" style="
                    background: #fff; 
                    color: #004A8C; 
                    border: 2px solid #004A8C; 
                    padding: 0.8em 1.5em; 
                    border-radius: 25px; 
                    font-family: 'Montserrat', sans-serif; 
                    font-weight: 700; 
                    font-size: 1em; 
                    cursor: pointer; 
                    transition: all 0.2s;
                " onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='#fff'">
                    <i class="fa-solid fa-download" style="margin-right:8px;"></i>Descargar PDF
                </button>
                <button id="modal-exito-aceptar" style="
                    background: #D70242; 
                    color: #fff; 
                    border: none; 
                    padding: 0.8em 2.5em; 
                    border-radius: 25px; 
                    font-family: 'Montserrat', sans-serif; 
                    font-weight: 700; 
                    font-size: 1em; 
                    cursor: pointer; 
                    box-shadow: 0 4px 12px rgba(215, 2, 66, 0.2); 
                    transition: all 0.2s;
                " onmouseover="this.style.background='#b00236'" onmouseout="this.style.background='#D70242'">
                    Aceptar
                </button>
            </div>
        `;

        // Contenedor para PDF
        let pdfContainer = document.getElementById('modal-exito-pdf');
        if (!pdfContainer) {
            pdfContainer = document.createElement('div');
            pdfContainer.id = 'modal-exito-pdf';
            pdfContainer.style.display = 'none';
            document.body.appendChild(pdfContainer);
        }
        pdfContainer.innerHTML = resumenHtml;

        // Mostrar en modal
        modal.querySelector('#modal-exito-content').innerHTML = resumenHtml + botonesHtml;
        modal.style.display = 'flex';

        document.getElementById('btn-descargar-pdf').onclick = () => {
            // Crear un contenedor temporal visible EXCLUSIVO para la generación
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = resumenHtml;
            
            // Estilos críticos: visible pero detrás del modal
            tempContainer.style.position = 'absolute';
            tempContainer.style.top = '0';
            tempContainer.style.left = '0';
            tempContainer.style.width = '794px'; // Ancho A4 (210mm) a 96dpi aprox
            tempContainer.style.background = '#fff';
            tempContainer.style.zIndex = '-9999'; 
            tempContainer.style.padding = '40px';
            document.body.appendChild(tempContainer);

            const qrImg = tempContainer.querySelector('#qr-img');

            async function generarPDF() {
                try {
                    // Cargar librerías si no existen
                    if (!window.jspdf) {
                        await new Promise((resolve) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                            script.onload = resolve;
                            document.head.appendChild(script);
                        });
                    }
                    if (!window.html2canvas) {
                        await new Promise((resolve) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                            script.onload = resolve;
                            document.head.appendChild(script);
                        });
                    }

                    // Esperar un poco para asegurar renderizado de fuentes e imágenes
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const canvas = await window.html2canvas(tempContainer, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        windowWidth: 1024
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = pdfWidth;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`dulceria_${idBoleta}.pdf`);

                } catch (error) {
                    console.error(error);
                    alert('Error al generar el PDF.');
                } finally {
                    if (tempContainer.parentNode) document.body.removeChild(tempContainer);
                }
            }

            if (qrImg && !qrImg.complete) {
                qrImg.onload = generarPDF;
                qrImg.onerror = generarPDF;
            } else {
                generarPDF();
            }
        };

        document.getElementById('modal-exito-aceptar').onclick = () => {
            modal.style.display = 'none';
            window.location.href = '../../index.html';
        };
    }

    async function procesarPago(idUsuario) {
        if (!idUsuario) {
            mostrarModalError('Error: No se pudo obtener un ID de usuario para la boleta.');
            return;
        }
        function getFechaPeru() {
            const now = new Date();
            const peruOffset = -5 * 60;
            const localOffset = now.getTimezoneOffset();
            const diff = peruOffset - localOffset;
            const peruDate = new Date(now.getTime() + diff * 60000);
            return peruDate.toISOString().slice(0, 10);
        }
        const fechaPeru = getFechaPeru();

        const datosBoleta = {
            idUsuario: idUsuario,
            fecha: fechaPeru,
            subtotal: total,
            descuentoTotal: 0,
            total: total
        };
        const payload = {
            ...datosBoleta,
            productosBoleta: productosArr
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
                await mostrarModalExito(resultadoPago.idBoleta);
            } else {
                mostrarModalError('Error en el pago: ' + resultadoPago.message);
            }
        } catch (err) {
            ocultarLoader();
            mostrarModalError('Error al conectar con el servidor para realizar el pago.');
        }
    }

    // Detectar todos los botones de pago
    form.querySelectorAll('button[type="submit"]').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const terminosCheckbox = document.getElementById('acepto-terminos');
            const tratamientoCheckbox = document.getElementById('acepto-tratamiento');
            if (!terminosCheckbox || !terminosCheckbox.checked) {
                alert('Debes aceptar los Términos y Condiciones antes de continuar con el pago.');
                return;
            }
            if (!tratamientoCheckbox || !tratamientoCheckbox.checked) {
                alert('Debes aceptar el Tratamiento Opcional de datos antes de continuar con el pago.');
                return;
            }

            if (sessionData.socio && sessionData.socio.id) {
                await procesarPago(sessionData.socio.id);
                return;
            }

            const nombreCompleto = form.nombre.value.trim();
            const correoElectronico = form.correo.value.trim();
            let tipoDocumento = '', numeroDocumento = '';
            const metodo = btn.getAttribute('data-metodo');
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
            if (!tipoDocumento || !numeroDocumento || !nombreCompleto || !correoElectronico) {
                alert('Completa todos los campos requeridos.');
                return;
            }
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
});
