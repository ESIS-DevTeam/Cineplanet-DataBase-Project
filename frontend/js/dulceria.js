import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');

    // Obtener datos de función y película
    let infoFuncion = null;
    if (idFuncion) {
        try {
            const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
            infoFuncion = await resInfo.json();
        } catch {
            // Si falla, muestra error pero sigue con productos
        }
    }

    // Renderiza la info de función y película
    const main = document.getElementById('info-container');
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

    // Obtén todos los productos activos
    let productos = [];
    try {
        const res = await fetch(BASE_API_DOMAIN + 'getProductos.php');
        productos = await res.json();
    } catch {
        main.innerHTML += '<div>Error al cargar productos.</div>';
        return;
    }

    // Agrupa productos por tipo y por socio
    const tipos = ['dulce', 'snack', 'combo', 'bebida', 'merch', 'complementario', 'otro'];
    const productosPorTipo = {};
    tipos.forEach(tipo => productosPorTipo[tipo] = []);
    const productosSocio = [];

    // Obtén productos por tipo usando el nuevo endpoint
    for (const tipo of tipos) {
        try {
            const res = await fetch(BASE_API_DOMAIN + `getProductosPorTipo.php?tipo=${tipo}`);
            const productosTipo = await res.json();
            productosPorTipo[tipo] = productosTipo.filter(prod => !prod.requiereSocio);
            productosSocio.push(...productosTipo.filter(prod => prod.requiereSocio));
        } catch {
            // Si falla, deja la sección vacía
        }
    }

    // Renderiza los botones de sección
    const seccionesDiv = document.createElement('div');
    seccionesDiv.style.marginBottom = '2em';

    tipos.forEach(tipo => {
        const btn = document.createElement('button');
        btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        btn.style.marginRight = '1em';
        btn.onclick = () => mostrarSeccion(tipo);
        seccionesDiv.appendChild(btn);
    });

    // Botón para productos de socio (solo si hay productos y el usuario está logueado)
    let socioData = null;
    let empleadoData = null;
    try {
        const res = await fetch('../../backend/auth/checkSession.php');
        const data = await res.json();
        if (data.loggedIn && data.socio) {
            socioData = data.socio;
        }
        // Verifica si el usuario tiene atributo 'empleado' en su cuenta
        if (data.loggedIn && data.socio && data.socio.empleado == 1) {
            empleadoData = data.socio;
        } else if (data.loggedIn && data.empleado) {
            empleadoData = data.empleado;
        }
    } catch {}
    if (productosSocio.length > 0 && (socioData || empleadoData)) {
        const btnSocio = document.createElement('button');
        btnSocio.textContent = 'Solo Socios';
        btnSocio.style.marginRight = '1em';
        btnSocio.onclick = () => mostrarSeccion('socio');
        seccionesDiv.appendChild(btnSocio);
    }
    main.appendChild(seccionesDiv);

    // Carrito de productos: [{prod, cantidad}]
    let carrito = [];

    // Contenedor para productos
    const productosDiv = document.createElement('div');
    main.appendChild(productosDiv);

    // Contenedor para el carrito (orden de dulcería)
    const ordenDiv = document.createElement('div');
    ordenDiv.id = 'orden-dulceria';
    main.appendChild(ordenDiv);

    // Renderiza el carrito como una sección debajo de los productos
    function renderCarrito() {
        ordenDiv.innerHTML = `
            <h2>Tu Orden de Dulcería</h2>
            <div>
                ${carrito.length === 0 
                    ? '<div>Aún no tienes productos agregados a tu orden.</div>' 
                    : `<ul>
                        ${carrito.map((item, idx) => `
                            <li>
                                ${item.prod.nombre} - S/${item.prod.precio} x ${item.cantidad} = S/${(item.prod.precio * item.cantidad).toFixed(2)}
                                <button onclick="window.__removeCarritoItem(${idx})">Quitar</button>
                            </li>
                        `).join('')}
                    </ul>`
                }
            </div>
            <div>
                <strong>Total: S/${carrito.reduce((sum, item) => sum + item.prod.precio * item.cantidad, 0).toFixed(2)}</strong>
            </div>
            <button id="continuar-btn">Continuar</button>
            <button id="ver-resumen-btn" type="button">Ver Resumen de compra</button>
        `;
        ordenDiv.querySelector('#continuar-btn').onclick = () => {
            // Construye productos=id-cant,id-cant,...
            const productosParam = carrito.map(item => `${item.prod.id}-${item.cantidad}`).join(',');
            const urlParams = new URLSearchParams();
            if (idPelicula) urlParams.set('pelicula', idPelicula);
            if (idFuncion) urlParams.set('funcion', idFuncion);
            if (asientos) urlParams.set('asientos', asientos);
            if (promos) urlParams.set('promos', promos);
            urlParams.set('productos', productosParam);
            console.log('Redirigiendo a pago.html con:', urlParams.toString());
            window.location.href = `pago.html?${urlParams.toString()}`;
        };

        ordenDiv.querySelector('#ver-resumen-btn').onclick = async () => {
            // Construye productos=id-cant,id-cant,...
            const productosParam = carrito.map(item => `${item.prod.id}-${item.cantidad}`).join(',');
            const resumenParams = new URLSearchParams();
            if (idPelicula) resumenParams.set('pelicula', idPelicula);
            if (idFuncion) resumenParams.set('funcion', idFuncion);
            if (asientos) resumenParams.set('asientos', asientos);
            if (promos) resumenParams.set('promos', promos);
            if (productosParam) resumenParams.set('productos', productosParam);

            // Crea el modal si no existe
            let resumenModal = document.getElementById('resumen-modal');
            if (!resumenModal) {
                resumenModal = document.createElement('div');
                resumenModal.id = 'resumen-modal';
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

            try {
                const res = await fetch(BASE_API_DOMAIN + 'getResumenCompra.php?' + resumenParams.toString());
                const resumen = await res.json();

                let html = `<div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2>Resumen de compra</h2>
                        <button type="button" id="btn-cerrar-resumen" style="background:#d50032; color:#fff; border:none; border-radius:20px; padding:0.3em 1em; font-size:1em; cursor:pointer;">Cerrar</button>
                    </div>
                    <div>`;
                if (resumen.asientos && resumen.asientos.length > 0) {
                    html += `<div><strong>Butacas Seleccionadas:</strong><br>${resumen.asientos.join(', ')} <span style="font-style:italic;">Cant. ${resumen.asientos.length}</span></div>`;
                }
                if (resumen.entradas && resumen.entradas.length > 0) {
                    html += `<div style="margin-top:1em;"><strong>Entradas:</strong></div>`;
                    resumen.entradas.forEach(e => {
                        html += `<div>
                            ${e.nombre}${e.descripcion ? `<br><span style="font-size:0.95em;">${e.descripcion}</span>` : ''}
                            <span style="font-style:italic;">Cant. ${e.cantidad}</span>
                            <span style="float:right;">S/${e.precio.toFixed(2)}</span>
                        </div>`;
                    });
                    html += `<div style="text-align:right; font-weight:bold;">Sub-Total S/${resumen.totalEntradas.toFixed(2)}</div>`;
                }
                if (resumen.dulceria && resumen.dulceria.length > 0) {
                    html += `<div style="margin-top:1em;"><strong>Dulcería:</strong></div>`;
                    resumen.dulceria.forEach(d => {
                        html += `<div>
                            ${d.nombre}${d.descripcion ? `<br><span style="font-size:0.95em;">${d.descripcion}</span>` : ''}
                            <span style="font-style:italic;">Cant. ${d.cantidad}</span>
                            <span style="float:right;">S/${d.precio.toFixed(2)}</span>
                        </div>`;
                    });
                    html += `<div style="text-align:right; font-weight:bold;">Sub-Total S/${resumen.totalDulceria.toFixed(2)}</div>`;
                }
                html += `<hr style="margin:1em 0;">`;
                html += `<div style="text-align:right; color:#d50032; font-size:1.3em; font-weight:bold;">Precio Total: S/${resumen.total.toFixed(2)}</div>`;
                html += `</div></div>`;

                resumenContainer.innerHTML = html;
                resumenModal.style.display = 'block';

                resumenContainer.querySelector('#btn-cerrar-resumen').onclick = () => {
                    resumenModal.style.display = 'none';
                };
            } catch (error) {
                resumenContainer.innerHTML = '<div>Error al cargar el resumen de compra.</div>';
                resumenModal.style.display = 'block';
            }
        };
    }

    // Función global para quitar producto del carrito
    window.__removeCarritoItem = function(idx) {
        carrito.splice(idx, 1);
        renderCarrito();
    };

    // Función para mostrar productos de una sección
    function mostrarSeccion(seccion) {
        productosDiv.innerHTML = '';
        if (seccion === 'socio') {
            // No mostrar info de socio/empleado

            // Filtrar productos según tipo de usuario y grado/rango
            let productosFiltrados = [];
            // Si es socio y NO es empleado
            if (socioData && (!socioData.empleado || socioData.empleado == 0)) {
                productosFiltrados = productosSocio.filter(prod => {
                    if (prod.requiereEmpleado == 1) return false;
                    if (prod.gradoMinimo) {
                        const grados = ['clasico', 'plata', 'oro', 'black'];
                        const userGradoIdx = grados.indexOf(socioData.grado);
                        const prodGradoIdx = grados.indexOf(prod.gradoMinimo);
                        return userGradoIdx >= prodGradoIdx;
                    }
                    return true;
                });
            }
            // Si es empleado (ya sea socio o empleadoData)
            if ((empleadoData && empleadoData.empleado == 1)) {
                // Solo productos que requieren empleado
                const productosEmpleado = productosSocio.filter(prod => prod.requiereEmpleado == 1);
                // Evita duplicados si el usuario es socio y empleado
                productosEmpleado.forEach(prod => {
                    if (!productosFiltrados.some(p => p.id === prod.id)) {
                        productosFiltrados.push(prod);
                    }
                });
            }

            productosFiltrados.forEach(prod => {
                productosDiv.appendChild(renderProducto(prod, true));
            });
        } else if (productosPorTipo[seccion]) {
            productosPorTipo[seccion].forEach(prod => {
                productosDiv.appendChild(renderProducto(prod, false));
            });
        }
    }

    // Modifica renderProducto para agregar al carrito con cantidad
    function renderProducto(prod, esSocio) {
        const divProd = document.createElement('div');
        divProd.style.border = '1px solid #ccc';
        divProd.style.margin = '8px 0';
        divProd.style.padding = '8px';

        function renderNormal() {
            divProd.innerHTML = `
                ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" width="80" height="80">` : ''}
                <strong>${prod.nombre}</strong><br>
                <span>${prod.descripcion || ''}</span><br>
                <span>Precio: S/${prod.precio}</span>
                ${esSocio ? `<div>Solo para socios</div>` : ''}
                ${prod.canjeaPuntos && esSocio ? `<div>Puedes canjear por ${prod.puntosNecesarios} puntos</div>` : ''}
                <button class="agregar-btn">Agregar</button>
            `;
            divProd.querySelector('.agregar-btn').onclick = () => renderCantidad();
        }

        function renderCantidad() {
            // Calcular cantidad máxima posible
            const totalActual = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            const maxAgregar = 10 - totalActual;
            if (maxAgregar <= 0) {
                alert('Máximo 10 productos en la orden.');
                return;
            }
            let cantidad = 1;
            divProd.innerHTML = `
                ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" width="80" height="80">` : ''}
                <strong>${prod.nombre}</strong><br>
                <span>${prod.descripcion || ''}</span><br>
                <span>Precio: S/${prod.precio}</span>
                <div>
                    <button class="menos-btn">-</button>
                    <span class="cantidad-span">${cantidad}</span>
                    <button class="mas-btn">+</button>
                    <span> (máx ${maxAgregar})</span>
                </div>
                <div style="margin-top:8px;">
                    <button class="aceptar-btn">Aceptar</button>
                    <button class="cancelar-btn">Cancelar</button>
                </div>
            `;
            const cantidadSpan = divProd.querySelector('.cantidad-span');
            divProd.querySelector('.menos-btn').onclick = () => {
                if (cantidad > 1) {
                    cantidad--;
                    cantidadSpan.textContent = cantidad;
                }
            };
            divProd.querySelector('.mas-btn').onclick = () => {
                if (cantidad < maxAgregar) {
                    cantidad++;
                    cantidadSpan.textContent = cantidad;
                }
            };
            divProd.querySelector('.aceptar-btn').onclick = () => {
                const idx = carrito.findIndex(item => item.prod.id === prod.id);
                if (idx >= 0) {
                    carrito[idx].cantidad += cantidad;
                } else {
                    carrito.push({prod, cantidad});
                }
                renderCarrito();
                renderNormal();
            };
            divProd.querySelector('.cancelar-btn').onclick = renderNormal;
        }

        renderNormal();
        return divProd;
    }

    // Muestra por defecto la primera sección (dulce)
    mostrarSeccion('dulce');

    // Renderiza el carrito inicialmente
    renderCarrito();
});
