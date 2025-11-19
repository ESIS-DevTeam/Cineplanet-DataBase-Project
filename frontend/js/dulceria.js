import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);

    // Obtener datos de función y película
    const idFuncion = params.get('funcion');
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

    // Contenedor para productos
    const productosDiv = document.createElement('div');
    main.appendChild(productosDiv);

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

    // Renderiza producto
    function renderProducto(prod, esSocio) {
        const divProd = document.createElement('div');
        divProd.style.border = '1px solid #ccc';
        divProd.style.margin = '8px 0';
        divProd.style.padding = '8px';
        divProd.innerHTML = `
            ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" style="width:80px;height:80px;">` : ''}
            <strong>${prod.nombre}</strong><br>
            <span>${prod.descripcion || ''}</span><br>
            <span>Precio: S/${prod.precio}</span>
            ${esSocio ? `<div style="color:green;">Solo para socios</div>` : ''}
            ${prod.canjeaPuntos && esSocio ? `<div>Puedes canjear por ${prod.puntosNecesarios} puntos</div>` : ''}
            <button>Agregar</button>
        `;
        return divProd;
    }

    // Muestra por defecto la primera sección (dulce)
    mostrarSeccion('dulce');
});
