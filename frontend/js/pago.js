import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');
    const productos = params.get('productos');

    let infoFuncion = null;
    if (idFuncion) {
        try {
            const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            infoFuncion = await resInfo.json();
        } catch {
            // Si falla, muestra error pero sigue
        }
    }

    const main = document.getElementById('info-container');
    if (main) {
        main.innerHTML = '';
        if (infoFuncion) {
            let fechaTexto = '';
            if (infoFuncion.fecha) {
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
            main.innerHTML += `
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
        }

        // Preparar promosBoleta: promos=id:cant,id:cant,...
        async function prepararPromosBoleta() {
            if (!promos) return [];
            const promoArr = promos.split(',').map(str => {
                const [id, cantidad] = str.split(':');
                return { idPromo: parseInt(id), cantidad: cantidad ? parseInt(cantidad) : 1 };
            });
            // Consultar detalle y descuento para cada promo
            const results = [];
            for (const promo of promoArr) {
                try {
                    const resPromo = await fetch(`${BASE_API_DOMAIN}getPromoDetalleDescuento.php?idPromo=${promo.idPromo}&idFuncion=${idFuncion}`);
                    const dataPromo = await resPromo.json();
                    results.push({
                        idPromo: promo.idPromo,
                        montoDescuento: dataPromo.montoDescuento || 0,
                        detalle: dataPromo.detalle || '',
                        cantidad: promo.cantidad
                    });
                } catch {
                    results.push({
                        idPromo: promo.idPromo,
                        montoDescuento: 0,
                        detalle: '',
                        cantidad: promo.cantidad
                    });
                }
            }
            return results;
        }

        // Preparar productosBoleta: productos=id-cant,id-cant,...
        async function prepararProductosBoleta() {
            if (!productos) return [];
            const prodArr = productos.split(',').map(str => {
                const [id, cantidad] = str.split('-');
                return { idProducto: parseInt(id), cantidad: cantidad ? parseInt(cantidad) : 1 };
            });
            const results = [];
            for (const prod of prodArr) {
                try {
                    const resProd = await fetch(`${BASE_API_DOMAIN}getProductoDetallePrecio.php?idProducto=${prod.idProducto}`);
                    const dataProd = await resProd.json();
                    const precioUnitario = dataProd.precioUnitario || 0;
                    results.push({
                        idProducto: prod.idProducto,
                        cantidad: prod.cantidad,
                        precioUnitario: precioUnitario,
                        subtotal: prod.cantidad * precioUnitario
                    });
                } catch {
                    results.push({
                        idProducto: prod.idProducto,
                        cantidad: prod.cantidad,
                        precioUnitario: 0,
                        subtotal: 0
                    });
                }
            }
            return results;
        }

        // Obtener resumen completo desde el endpoint
        let resumen = null;
        let productosBoleta = [];
        let promosBoleta = [];
        let asientosBoleta = [];
        try {
            const url = `${BASE_API_DOMAIN}/getResumenCompra.php?funcion=${idFuncion || ''}&pelicula=${idPelicula || ''}&asientos=${asientos || ''}&promos=${promos || ''}&productos=${productos || ''}`;
            const res = await fetch(url);
            resumen = await res.json();

            // Preparar productosBoleta con precio y detalle
            productosBoleta = await prepararProductosBoleta();

            // Preparar promosBoleta con detalle y descuento
            promosBoleta = await prepararPromosBoleta();

            // Preparar asientosBoleta: asigna a cada asiento el precio de la entrada/promo correspondiente
            // Ejemplo: resumen.entradas = [{nombre, cantidad, precio, asientos: [A1, A2]}, ...]
            if (Array.isArray(resumen.entradas) && asientos) {
                let asientosArr = asientos.split(',').map(id => id.trim()).filter(x => x);
                let asientoPromoMap = [];
                let used = new Set();
                resumen.entradas.forEach(entrada => {
                    // Asigna el precio de la entrada a la cantidad de asientos que corresponda
                    let count = 0;
                    for (let i = 0; i < asientosArr.length && count < entrada.cantidad; i++) {
                        if (!used.has(asientosArr[i])) {
                            asientoPromoMap.push({
                                idPlanoSala: parseInt(asientosArr[i]),
                                precioUnitario: entrada.precio
                            });
                            used.add(asientosArr[i]);
                            count++;
                        }
                    }
                });
                // Si quedan asientos sin asignar (por error), asígnales el precio base
                for (let i = 0; i < asientosArr.length; i++) {
                    if (!used.has(asientosArr[i])) {
                        asientoPromoMap.push({
                            idPlanoSala: parseInt(asientosArr[i]),
                            precioUnitario: resumen.precio || 0
                        });
                    }
                }
                asientosBoleta = asientoPromoMap;
            } else if (asientos) {
                // Fallback: todos los asientos con el mismo precio
                let precioAsiento = resumen.precioFinalAsiento || resumen.precioFinal || resumen.totalAsiento || resumen.precio || 0;
                asientosBoleta = asientos.split(',').map(id => ({
                    idPlanoSala: parseInt(id),
                    precioUnitario: precioAsiento
                }));
            }

            // Guardar en el resumen para el autofill
            resumen.productosBoleta = productosBoleta;
            resumen.promosBoleta = promosBoleta;
            resumen.asientosBoleta = asientosBoleta;

            // Guardar resumen global para el autofill
            window.resumenCompra = resumen;
        } catch {
            document.getElementById('info-container').innerHTML += '<div>Error al obtener el resumen de la compra.</div>';
            return;
        }

        // Visualizar los datos preparados en la página
        const debugDiv = document.createElement('div');
        debugDiv.style = 'background:#f9f9f9;border:1px solid #ccc;padding:1em;margin:1em 0;max-height:300px;overflow:auto;font-size:0.95em;';
        debugDiv.innerHTML = `
            <b>PRODUCTOS_BOLETA:</b>
            <pre>${JSON.stringify(productosBoleta, null, 2)}</pre>
            <b>PROMO_BOLETA:</b>
            <pre>${JSON.stringify(promosBoleta, null, 2)}</pre>
            <b>BOLETA_ASIENTO:</b>
            <pre>${JSON.stringify(asientosBoleta, null, 2)}</pre>
        `;
        main.appendChild(debugDiv);

        // Mostrar total y botón de resumen
        const resumenDiv = document.createElement('div');
        resumenDiv.innerHTML = `
            <div style="font-size:1.2em; margin:1em 0;">
                <strong>Total a pagar: S/${resumen.total.toFixed(2)}</strong>
            </div>
            <button id="btn-ver-resumen">Ver resumen de la compra</button>
        `;
        document.getElementById('info-container').appendChild(resumenDiv);

        document.getElementById('btn-ver-resumen').onclick = () => {
            // Renderiza el resumen en un modal simple (puedes mejorar el diseño)
            let html = `<div style="background:#fff;padding:2em;max-width:500px;margin:2em auto;border-radius:8px;">
                <h2>Resumen de compra</h2>
                <div><b>Butacas Seleccionadas:</b> ${resumen.asientos.join(', ') || '-'}</div>
                <div style="margin-top:1em;"><b>Entradas:</b></div>
                ${resumen.entradas.length === 0 ? '<div>-</div>' : resumen.entradas.map(e => `
                    <div>
                        <span>${e.nombre}</span><br>
                        <small>${e.descripcion || ''}</small><br>
                        Cant. ${e.cantidad} &nbsp; S/${e.precio} &nbsp; Sub-Total S/${e.subtotal.toFixed(2)}
                    </div>
                `).join('')}
                ${resumen.dulceria.length > 0 ? `
                <div style="margin-top:1em;"><b>Dulcería:</b></div>
                ${resumen.dulceria.map(d => `
                    <div>
                        <span>${d.nombre}</span><br>
                        <small>${d.descripcion || ''}</small><br>
                        Cant. ${d.cantidad} &nbsp; S/${d.precio} &nbsp; Sub-Total S/${d.subtotal.toFixed(2)}
                    </div>
                `).join('')}
                ` : ''}
                <hr>
                <div style="font-size:1.2em;color:#d50032;text-align:right;">
                    Precio Total: S/${resumen.total.toFixed(2)}
                </div>
                <div style="text-align:right;margin-top:1em;">
                    <button id="cerrar-modal-resumen">Cerrar</button>
                </div>
            </div>`;
            // Modal básico
            let modal = document.createElement('div');
            modal.id = 'modal-resumen-compra';
            modal.style.position = 'fixed';
            modal.style.top = '0'; modal.style.left = '0'; modal.style.right = '0'; modal.style.bottom = '0';
            modal.style.background = 'rgba(0,0,0,0.2)';
            modal.style.zIndex = '9999';
            modal.innerHTML = html;
            document.body.appendChild(modal);
            document.getElementById('cerrar-modal-resumen').onclick = () => {
                modal.remove();
            };
        };
    }
});