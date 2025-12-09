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

    // NUEVO: Renderiza la info en el panel izquierdo
    const infoFuncionDulceria = document.getElementById('info-funcion-dulceria');
    if (infoFuncionDulceria) {
        infoFuncionDulceria.innerHTML = '';
        if (idCiudad && idCine) {
            try {
                const res = await fetch(BASE_API_DOMAIN + `getInfoCine.php?idCine=${idCine}`);
                const cine = await res.json();
                infoFuncionDulceria.innerHTML = `
                    <div class="info-funcion-dulceria-card info-funcion-card">
                        ${cine.imagen ? `<img src="../images/portrait/cines/${cine.imagen}" alt="Foto cine" class="portada-circular">` : ''}
                        <h2 class="titulo-pelicula">${cine.nombre || ''}</h2>
                        <div class="cine-nombre">${cine.direccion || ''}</div>
                        <hr>
                    </div> 
                `;
            } catch {
                infoFuncionDulceria.textContent = 'No se pudo cargar la información del cine.';
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
                infoFuncionDulceria.innerHTML = `
                    <div class="info-funcion-dulceria-card info-funcion-card">
                        ${infoFuncion.portada ? `<img src="../images/portrait/movie/${infoFuncion.portada}" alt="Portada" class="portada-circular">` : ''}
                        <h2 class="titulo-pelicula">${infoFuncion.nombrePelicula || ''}</h2>
                        <div class="formato-linea">${infoFuncion.formato || ''}${infoFuncion.formato && infoFuncion.idioma ? ', ' : ''}${infoFuncion.idioma || ''}</div>
                        <div class="cine-nombre">${infoFuncion.nombreCine || ''}</div>
                        <ul class="info-lista">
                            <li><span class="icono"><i class="fa-regular fa-calendar"></i></span>${fechaTexto}</li>
                            <li><span class="icono"><i class="fa-regular fa-clock"></i></span>${infoFuncion.hora || ''}</li>
                            <li><span class="icono"><i class="fa-solid fa-chair"></i></span>${infoFuncion.nombreSala || ''}</li>
                        </ul>
                        <hr>
                    </div>
                `;
            }
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

    // Elimina los botones de sección antiguos
    // const seccionesDiv = document.createElement('div');
    // seccionesDiv.style.marginBottom = '2em';
    // tipos.forEach(tipo => {
    //     const btn = document.createElement('button');
    //     btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    //     btn.style.marginRight = '1em';
    //     btn.onclick = () => mostrarSeccion(tipo);
    //     seccionesDiv.appendChild(btn);
    // });

    // Botón para productos de socio (solo si hay productos y el usuario está logueado)
    let socioData = null;
    let empleadoData = null;
    let puntosSocio = 0;

    // NUEVO: función para obtener puntos del socio desde endpoint (igual que en entradas.js)
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

    try {
        const res = await fetch('../../backend/auth/checkSession.php');
        const data = await res.json();
        if (data.loggedIn && data.socio) {
            socioData = data.socio;
            // NUEVO: obtener puntos del socio
            puntosSocio = await obtenerPuntosSocio(socioData.id);
        }
        // Verifica si el usuario tiene atributo 'empleado' en su cuenta
        if (data.loggedIn && data.socio && data.socio.empleado == 1) {
            empleadoData = data.socio;
        } else if (data.loggedIn && data.empleado) {
            empleadoData = data.empleado;
        }
    } catch {}
    if (productosSocio.length > 0 && (socioData || empleadoData)) {
        // const btnSocio = document.createElement('button');
        // btnSocio.textContent = 'Solo Socios';
        // btnSocio.style.marginRight = '1em';
        // btnSocio.onclick = () => mostrarSeccion('socio');
        // seccionesDiv.appendChild(btnSocio);
    }
    // main.appendChild(seccionesDiv);

    // Carrito de productos: [{prod, cantidad}]
    let carrito = [];
    let seccionActiva = ''; // Variable para rastrear la sección actual

    // Contenedor para productos
    const productosDiv = document.createElement('div');
    main.appendChild(productosDiv);

    // Contenedor para el carrito (orden de dulcería)
    const ordenDiv = document.createElement('div');
    ordenDiv.id = 'orden-dulceria';
    main.appendChild(ordenDiv);

    // Renderiza el carrito como una sección debajo de los productos
    function renderCarrito() {
        const total = carrito.reduce((sum, item) => sum + item.prod.precio * item.cantidad, 0);
        const esStandalone = idCiudad && idCine; // Determina si es flujo solo dulcería

        ordenDiv.innerHTML = `
            <div class="orden-titulo">
                Tu Orden de Dulcería <i class="fa-solid fa-ticket"></i>
            </div>
            <div class="orden-layout">
                <div class="orden-items-container">
                    ${carrito.length === 0 
                        ? '<div style="color:#666; padding:10px;">No has seleccionado productos.</div>' 
                        : carrito.map((item, idx) => `
                            <div class="orden-item">
                                <span class="orden-item-nombre">${item.cantidad} x ${item.prod.nombre}</span>
                                <span class="orden-item-precio">S/${(item.prod.precio * item.cantidad).toFixed(2)}</span>
                                <button class="orden-item-delete" onclick="window.__removeCarritoItem(${idx})">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        `).join('')
                    }
                    ${carrito.length > 0 ? `
                        <div class="orden-item" style="border-top: 1px solid #ccc; margin-top:10px; padding-top:10px; font-weight:900;">
                            <span class="orden-item-nombre">Total</span>
                            <span class="orden-item-precio">S/${total.toFixed(2)}</span>
                            <span style="width:20px;"></span>
                        </div>
                    ` : ''}
                </div>
                <div class="orden-botones-container">
                    <button id="continuar-btn" class="btn-orden-completada">
                        ${esStandalone ? 'Orden Completada' : 'Continuar'}
                    </button>
                    ${esStandalone ? '<button id="cancelar-orden-btn" class="btn-cancelar-orden">Cancelar orden</button>' : ''}
                </div>
            </div>
        `;
        
        const continuarBtn = ordenDiv.querySelector('#continuar-btn');
        const cancelarOrdenBtn = ordenDiv.querySelector('#cancelar-orden-btn');

        // Si vino de dulceriaLading, requiere al menos un producto
        if (esStandalone) {
            continuarBtn.disabled = carrito.length === 0;
        }
        continuarBtn.onclick = () => {
            if (esStandalone && carrito.length === 0) {
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
            if (esStandalone) {
                window.location.href = `pagoDulceria.html?${urlParams.toString()}`;
            } else {
                window.location.href = `pago.html?${urlParams.toString()}`;
            }
        };

        // Lógica para cancelar orden (vaciar carrito) - Solo si existe el botón
        if (cancelarOrdenBtn) {
            cancelarOrdenBtn.onclick = () => {
                if(confirm('¿Estás seguro de que deseas cancelar la compra?')) {
                    // Redirige a la landing de dulcería
                    window.location.href = `dulceriaLading.html?ciudad=${idCiudad}&cine=${idCine}`;
                }
            };
        }
    }

    // Función global para quitar producto del carrito
    window.__removeCarritoItem = function(idx) {
        const item = carrito[idx];
        // NUEVO: restaurar puntos si el producto se canjeaba por puntos
        if (item.prod.canjeaPuntos && item.prod.puntosNecesarios && socioData) {
            const puntosARestaurar = item.cantidad * item.prod.puntosNecesarios;
            puntosSocio += puntosARestaurar;
            
            // NUEVO: actualizar el display de puntos disponibles en la vista normal del producto
            const puntosDisplayDiv = document.getElementById(`puntos-disponibles-${item.prod.id}`);
            if (puntosDisplayDiv) {
                puntosDisplayDiv.textContent = `Puntos disponibles: ${puntosSocio} | Necesarios: ${item.prod.puntosNecesarios}`;
            }
        }
        carrito.splice(idx, 1);
        renderCarrito();
    };

    // Define las categorías y sus íconos (FontAwesome)
    const categorias = [
        { key: 'dulce', label: 'Dulces', icon: 'fa-solid fa-candy-cane' },
        { key: 'snack', label: 'Snacks', icon: 'fa-solid fa-cookie-bite' }, // Fallback si fa-popcorn no carga
        { key: 'combo', label: 'Combos', icon: 'fa-solid fa-box' },
        { key: 'bebida', label: 'Bebidas', icon: 'fa-solid fa-bottle-water' },
        { key: 'merch', label: 'Merch', icon: 'fa-solid fa-gift' },
        { key: 'complementario', label: 'Complementos', icon: 'fa-solid fa-plus' },
        { key: 'otro', label: 'Otros', icon: 'fa-solid fa-ellipsis' }
    ];

    // Renderiza la barra de categorías con íconos y botón de socio si corresponde
    function renderCategoriasBarra(activaKey) {
        const barra = document.createElement('div');
        barra.className = 'dulceria-categorias-barra';
        barra.style.display = 'flex';
        barra.style.alignItems = 'flex-end';
        barra.style.justifyContent = 'center'; // Centra los íconos del menú
        barra.style.gap = '32px';
        barra.style.marginBottom = '24px';
        barra.style.flexWrap = 'wrap';

        categorias.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'dulceria-categoria-btn' + (activaKey === cat.key ? ' activa' : '');
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'Montserrat, sans-serif';
            btn.style.fontWeight = activaKey === cat.key ? 'bold' : 'normal';
            btn.style.color = activaKey === cat.key ? '#004A8C' : '#222';
            btn.style.fontSize = '1em';
            btn.style.padding = '0';
            btn.style.position = 'relative';

            btn.innerHTML = `
                <span style="font-size:2.2em; margin-bottom:4px;">
                    <i class="${cat.icon}"></i>
                </span>
                <span style="font-size:0.98em; text-align:center; line-height:1.1;">
                    ${cat.label}
                </span>
                ${activaKey === cat.key ? '<span style="height:3px;width:0px;background:#004A8C;display:block;margin-top:4px;border-radius:2px;"></span>' : ''}
            `;
            btn.onclick = () => mostrarSeccion(cat.key);
            barra.appendChild(btn);
        });

        // Botón "Solo Socios" con ícono, si corresponde
        if (productosSocio.length > 0 && (socioData || empleadoData)) {
            const btnSocio = document.createElement('button');
            btnSocio.className = 'dulceria-categoria-btn' + (activaKey === 'socio' ? ' activa' : '');
            btnSocio.style.display = 'flex';
            btnSocio.style.flexDirection = 'column';
            btnSocio.style.alignItems = 'center';
            btnSocio.style.justifyContent = 'center';
            btnSocio.style.background = 'none';
            btnSocio.style.border = 'none';
            btnSocio.style.cursor = 'pointer';
            btnSocio.style.fontFamily = 'Montserrat, sans-serif';
            btnSocio.style.fontWeight = activaKey === 'socio' ? 'bold' : 'normal';
            btnSocio.style.color = activaKey === 'socio' ? '#004A8C' : '#222';
            btnSocio.style.fontSize = '1em';
            btnSocio.style.padding = '0';
            btnSocio.style.position = 'relative';

            btnSocio.innerHTML = `
                <span style="font-size:2.2em; margin-bottom:4px;">
                    <i class="fa-solid fa-user"></i>
                </span>
                <span style="font-size:0.98em; text-align:center; line-height:1.1;">
                    Solo Socios
                </span>
                ${activaKey === 'socio' ? '<span style="height:3px;width:32px;background:#004A8C;display:block;margin-top:4px;border-radius:2px;"></span>' : ''}
            `;
            btnSocio.onclick = () => mostrarSeccion('socio');
            barra.appendChild(btnSocio);
        }

        return barra;
    }

    // Modifica mostrarSeccion para usar la barra de categorías
    function mostrarSeccion(seccion) {
        seccionActiva = seccion; // Guardar sección activa
        productosDiv.innerHTML = '';
        productosDiv.appendChild(renderCategoriasBarra(seccion));

        // Crea el grid de productos (3 columnas por fila)
        const gridDiv = document.createElement('div');
        gridDiv.className = 'productos-grid'; // Usamos la clase CSS definida en HTML

        let productosFiltrados = [];
        if (seccion === 'socio') {
            // Filtrar productos según tipo de usuario y grado/rango
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
                const productosEmpleado = productosSocio.filter(prod => prod.requiereEmpleado == 1);
                // Evita duplicados si el usuario es socio y empleado
                productosEmpleado.forEach(prod => {
                    if (!productosFiltrados.some(p => p.id === prod.id)) {
                        productosFiltrados.push(prod);
                    }
                });
            }
        } else if (productosPorTipo[seccion]) {
            productosFiltrados = productosPorTipo[seccion];
        }

        productosFiltrados.forEach(prod => {
            gridDiv.appendChild(renderProducto(prod, seccion === 'socio'));
        });

        productosDiv.appendChild(gridDiv);
    }

    // Modifica renderProducto para agregar al carrito with quantity
    function renderProducto(prod, esSocio) {
        const divProd = document.createElement('div');
        divProd.className = 'producto-card'; // Usamos la clase CSS definida en HTML

        function renderNormal() {
            divProd.innerHTML = `
                <img src="../images/portrait/candy/${prod.imagen || 'default.png'}" alt="${prod.nombre}" class="producto-img">
                <div class="producto-info">
                    <div class="producto-titulo">${prod.nombre}</div>
                    <div class="producto-desc">${prod.descripcion || ''}</div>
                </div>
                <div class="producto-precio-row">
                    <span class="producto-precio-label">Precio desde:</span>
                    <span class="producto-precio-valor">S/${parseFloat(prod.precio).toFixed(2)}</span>
                </div>
                ${esSocio ? `<div class="etiqueta-socio">Solo para socios</div>` : ''}
                ${prod.canjeaPuntos && esSocio && socioData ? `<div id="puntos-disponibles-${prod.id}" class="puntos-info">Puntos disponibles: ${puntosSocio} | Necesarios: ${prod.puntosNecesarios}</div>` : ''}
                <button class="btn-agregar-producto">
                    <i class="fa-solid fa-cart-plus"></i> Agregar
                </button>
            `;
            divProd.querySelector('.btn-agregar-producto').onclick = () => renderCantidad();
        }

        function renderCantidad() {
            // Calcular cantidad máxima posible
            const totalActual = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            let maxAgregar = 10 - totalActual;

            // NUEVO: Si el producto se puede canjear por puntos, limitar por puntos disponibles
            if (prod.canjeaPuntos && esSocio && socioData && prod.puntosNecesarios) {
                const maxPorPuntos = Math.floor(puntosSocio / prod.puntosNecesarios);
                maxAgregar = Math.min(maxAgregar, maxPorPuntos);
            }

            if (maxAgregar <= 0) {
                if (prod.canjeaPuntos && esSocio && socioData) {
                    alert('No tienes suficientes puntos para canjear este producto.');
                } else {
                    alert('Máximo 10 productos en la orden.');
                }
                return;
            }
            let cantidad = 1;
            
            divProd.innerHTML = `
                <img src="../images/portrait/candy/${prod.imagen || 'default.png'}" alt="${prod.nombre}" class="producto-img">
                <div class="producto-titulo">${prod.nombre}</div>
                
                <div class="producto-contador-container">
                    ${prod.canjeaPuntos && esSocio && socioData ? `<div id="puntos-restantes-${prod.id}" class="puntos-info">Puntos disponibles: ${puntosSocio} | Necesarios: ${prod.puntosNecesarios}</div>` : ''}
                    
                    <div class="producto-contador">
                        <button class="btn-count menos-btn">-</button>
                        <span class="count-display cantidad-span">${cantidad}</span>
                        <button class="btn-count mas-btn">+</button>
                    </div>
                    <div class="max-msg">(máx ${maxAgregar})</div>
                </div>

                <div class="acciones-botones">
                    <button class="btn-aceptar aceptar-btn">Aceptar</button>
                    <button class="btn-cancelar cancelar-btn">Cancelar</button>
                </div>
            `;
            
            const cantidadSpan = divProd.querySelector('.cantidad-span');
            const puntosRestantesDiv = divProd.querySelector(`#puntos-restantes-${prod.id}`);
            
            // NUEVO: función para actualizar puntos restantes
            function actualizarPuntosRestantes() {
                if (prod.canjeaPuntos && esSocio && socioData && puntosRestantesDiv) {
                    const puntosUsados = cantidad * (prod.puntosNecesarios || 0);
                    const puntosRestantes = puntosSocio - puntosUsados;
                    puntosRestantesDiv.textContent = `Puntos disponibles: ${puntosRestantes} | Necesarios: ${prod.puntosNecesarios}`;
                }
            }

            divProd.querySelector('.menos-btn').onclick = () => {
                if (cantidad > 1) {
                    cantidad--;
                    cantidadSpan.textContent = cantidad;
                    actualizarPuntosRestantes();
                }
            };
            divProd.querySelector('.mas-btn').onclick = () => {
                if (cantidad < maxAgregar) {
                    cantidad++;
                    cantidadSpan.textContent = cantidad;
                    actualizarPuntosRestantes();
                }
            };
            divProd.querySelector('.aceptar-btn').onclick = () => {
                // NUEVO: descontar puntos del total global antes de agregar al carrito
                if (prod.canjeaPuntos && prod.puntosNecesarios && socioData) {
                    const puntosADescontar = cantidad * prod.puntosNecesarios;
                    puntosSocio -= puntosADescontar;
                }

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

            // Inicializar puntos restantes
            actualizarPuntosRestantes();
        }

        renderNormal();
        return divProd;
    }

    // Muestra por defecto la primera categoría (o socio si solo hay productos socio)
    if (productosSocio.length > 0 && (socioData || empleadoData)) {
        mostrarSeccion('dulce');
    } else {
        mostrarSeccion(categorias[0].key);
    }

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

    // Botón cancelar compra al lado del logo de usuario
    const socioDisplay = document.getElementById('socio-display');
    if (socioDisplay) {
        const cancelarBtn = document.createElement('button');
        cancelarBtn.textContent = 'Cancelar compra';
        cancelarBtn.style.marginLeft = '1em';
        cancelarBtn.style.background = '#d32f2f';
        cancelarBtn.style.color = '#fff';
        cancelarBtn.style.border = 'none';
        cancelarBtn.style.padding = '0.7em 1.5em';
        cancelarBtn.style.borderRadius = '8px';
        cancelarBtn.style.fontWeight = 'bold';
        cancelarBtn.style.cursor = 'pointer';

        cancelarBtn.onclick = () => {
            if (idCiudad && idCine) {
                window.location.href = `dulceriaLading.html?ciudad=${idCiudad}&cine=${idCine}`;
            } else if (idPelicula) {
                window.location.href = `peliculaSeleccion.html?pelicula=${idPelicula}`;
            } else {
                window.location.href = 'peliculas.html';
            }
        };

        socioDisplay.parentNode.insertBefore(cancelarBtn, socioDisplay.nextSibling);
    }
});
