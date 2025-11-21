import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula');
    const asientos = params.get('asientos');
    const promos = params.get('promos');
    const idCiudad = params.get('ciudad');
    const idCine = params.get('cine');

    const main = document.getElementById('info-container');
    main.innerHTML = '';

    // Si viene de dulceriaLading (tiene ciudad y cine), muestra solo la foto y nombre del cine
    if (idCiudad && idCine) {
        try {
            const res = await fetch(BASE_API_DOMAIN + `getInfoCine.php?idCine=${idCine}`);
            const cine = await res.json();
            main.innerHTML = `
                <div style="text-align:center;">
                    ${cine.imagen ? `<img src="${cine.imagen}" alt="Foto cine" style="width:140px;height:140px;border-radius:12px;object-fit:cover;">` : ''}
                </div>
                <h2 style="text-align:center; margin:0.5em 0;">${cine.nombre || ''}</h2>
                <div style="text-align:center;">${cine.direccion || ''}</div>
                <hr style="margin:1em 0;">
            `;
        } catch {
            main.textContent = 'No se pudo cargar la información del cine.';
        }
    } else {
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
        `;
        const continuarBtn = ordenDiv.querySelector('#continuar-btn');
        // Si vino de dulceriaLading, requiere al menos un producto
        if (idCiudad && idCine) {
            continuarBtn.disabled = carrito.length === 0;
        }
        continuarBtn.onclick = () => {
            if (idCiudad && idCine && carrito.length === 0) {
                alert('Debes elegir al menos un producto para continuar.');
                return;
            }
            // Construye productos=id-cant,id-cant,...
            const productosParam = carrito.map(item => `${item.prod.id}-${item.cantidad}`).join(',');
            const urlParams = new URLSearchParams();
            if (idPelicula) urlParams.set('pelicula', idPelicula);
            if (idFuncion) urlParams.set('funcion', idFuncion);
            if (asientos) urlParams.set('asientos', asientos);
            if (promos) urlParams.set('promos', promos);
            urlParams.set('productos', productosParam);
            // Agrega ciudad y cine si existen
            if (idCiudad) urlParams.set('ciudad', idCiudad);
            if (idCine) urlParams.set('cine', idCine);
            console.log('Redirigiendo a pago con:', urlParams.toString());
            if (idCiudad && idCine) {
                window.location.href = `pagoDulceria.html?${urlParams.toString()}`;
            } else {
                window.location.href = `pago.html?${urlParams.toString()}`;
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

    // Modifica renderProducto para agregar al carrito with quantity
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

    // --- NUEVO: Mostrar símbolo de socio en la esquina superior derecha ---
    let sessionData = {};
    try {
        const sessionRes = await fetch('../../backend/auth/checkSession.php');
        sessionData = await sessionRes.json();
        const socioDisplay = document.getElementById('socio-display');
        if (socioDisplay) {
            if (sessionData.socio && sessionData.socio.nombre) {
                const nombre = sessionData.socio.nombre;
                const iniciales = nombre.split(' ').map(word => word[0]).join('').toUpperCase();
                socioDisplay.textContent = iniciales;
            } else {
                socioDisplay.textContent = '👤';
            }
        }
    } catch (error) {
        const socioDisplay = document.getElementById('socio-display');
        if (socioDisplay) socioDisplay.textContent = '👤';
    }
});
