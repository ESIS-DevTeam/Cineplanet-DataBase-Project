import BASE_API_DOMAIN from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    const idPelicula = params.get('pelicula'); // <-- extrae idPelicula también
    if (!idFuncion) {
        document.getElementById('asientos-container').textContent = 'No se ha seleccionado función.';
        return;
    }

    // Obtener datos completos de la función y película
    let infoFuncion = null;
    try {
        const resInfo = await fetch(BASE_API_DOMAIN + `getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
        infoFuncion = await resInfo.json();
    } catch {
        // Si falla, muestra error y no dibuja nada
        document.getElementById('asientos-container').textContent = 'Error al obtener la información de la función.';
        return;
    }

    // Mostrar información de la función en el panel izquierdo
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-funcion-card';

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

    // Asegura que el contenedor existe y lo llena
    const infoFuncionContainer = document.getElementById('info-funcion');
    if (infoFuncionContainer) {
        infoFuncionContainer.innerHTML = '';
        infoFuncionContainer.appendChild(infoDiv);
    }

    // El resto igual, pero ahora container es solo para asientos
    const container = document.getElementById('asientos-container');
    container.innerHTML = ''; // Limpia antes de agregar

    // Obtener idSala desde la función
    let idSala = infoFuncion.idSala;
    if (!idSala) {
        container.textContent = 'Error al obtener la sala de la función.';
        return;
    }

    // Obtener asientos del plano de la sala
    let asientosPlano = [];
    try {
        const resPlano = await fetch(BASE_API_DOMAIN + `getPlanoSalaPorSala.php?idSala=${idSala}`);
        asientosPlano = await resPlano.json();
    } catch {
        container.textContent = 'Error al obtener el plano de sala.';
        return;
    }

    // Opcional: obtener ocupados para la función
    let ocupados = new Set();
    try {
        const resOcupados = await fetch(BASE_API_DOMAIN + `getAsientosOcupadosPorFuncion.php?idFuncion=${idFuncion}`);
        const ocupadosArr = await resOcupados.json();
        ocupados = new Set(ocupadosArr.map(a => a.idPlanoSala));
    } catch {
        // Si no existe el endpoint, no marcar ocupados
    }

    // Detectar filas y columnas
    const filasSet = new Set(asientosPlano.map(a => a.fila));
    const columnasSet = new Set(asientosPlano.map(a => a.numero));
    const filas = Array.from(filasSet).sort();
    const columnas = Array.from(columnasSet).sort((a, b) => a - b);

    // --- Pantalla visual arriba ---
    const pantallaDiv = document.createElement('div');
    pantallaDiv.className = 'pantalla-cine';
    pantallaDiv.innerHTML = `
        <div class="pantalla-texto">Pantalla</div>
        <div class="pantalla-barra"></div>
    `;
    container.appendChild(pantallaDiv);

    // --- Grilla de asientos ---
    const grillaDiv = document.createElement('div');
    grillaDiv.className = 'grilla-asientos';

    // Primera fila: letras de columna (opcional, no en la imagen)
    // Segunda fila en adelante: filas de asientos
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const filaRow = document.createElement('div');
        filaRow.className = 'fila-asientos';

        // Letra de fila izquierda
        const letraIzq = document.createElement('span');
        letraIzq.className = 'fila-letra-grilla';
        letraIzq.textContent = fila;
        filaRow.appendChild(letraIzq);

        // Asientos
        for (const numero of columnas) {
            const asientoObj = asientosPlano.find(a => a.fila === fila && a.numero == numero);
            if (!asientoObj || asientoObj.tipo === 'pasillo') {
                const espacio = document.createElement('span');
                espacio.className = 'asiento-circulo asiento-vacio';
                filaRow.appendChild(espacio);
                continue;
            }

            const asientoDiv = document.createElement('span');
            asientoDiv.className = 'asiento-circulo';
            asientoDiv.dataset.idPlanoSala = asientoObj.id;
            asientoDiv.title = `${fila}${numero}`;

            // Estado visual
            if (ocupados.has(asientoObj.id)) {
                asientoDiv.classList.add('ocupado');
            } else if (asientoObj.tipo === 'discapacidad') {
                asientoDiv.classList.add('discapacidad');
            }

            // Selección
            asientoDiv.addEventListener('click', () => {
                if (ocupados.has(asientoObj.id)) return;
                if (asientoDiv.classList.contains('seleccionado')) {
                    asientoDiv.classList.remove('seleccionado');
                    seleccionados.delete(asientoObj.id);
                } else {
                    if (seleccionados.size >= MAX_SELECCION) {
                        alert('Solo puedes seleccionar hasta 10 asientos.');
                        return;
                    }
                    asientoDiv.classList.add('seleccionado');
                    seleccionados.add(asientoObj.id);
                }
                actualizarSeleccion();
            });

            filaRow.appendChild(asientoDiv);
        }

        // Letra de fila derecha
        const letraDer = document.createElement('span');
        letraDer.className = 'fila-letra-grilla';
        letraDer.textContent = fila;
        filaRow.appendChild(letraDer);

        grillaDiv.appendChild(filaRow);
    }
    container.appendChild(grillaDiv);

    // --- Leyenda y mensaje accesibilidad ---
    const leyendaDiv = document.createElement('div');
    leyendaDiv.className = 'leyenda-grilla';
    leyendaDiv.innerHTML = `
        <span class="asiento-circulo leyenda disponible"></span> Disponible
        <span class="asiento-circulo leyenda ocupado"></span> Ocupada
        <span class="asiento-circulo leyenda seleccionada"></span> Seleccionada
        <span class="asiento-circulo leyenda discapacidad"><i class="fa-solid fa-wheelchair"></i></span> Silla de ruedas
    `;
    container.appendChild(leyendaDiv);

    const accesDiv = document.createElement('div');
    accesDiv.className = 'accesibilidad-msg';
    accesDiv.innerHTML = `<i class="fa-solid fa-wheelchair"></i> Todas nuestras salas cuentan con espacios señalizados para sillas de ruedas, consulta en boletería la ubicación de las mismas.`;
    container.appendChild(accesDiv);

    // --- Butacas seleccionadas y botón continuar ---
    const seleccionadasDiv = document.createElement('div');
    seleccionadasDiv.className = 'butacas-seleccionadas';
    seleccionadasDiv.innerHTML = `<strong>Butacas seleccionadas:</strong> <span class="butacas-lista"></span>`;
    container.appendChild(seleccionadasDiv);

    const btnContinuar = document.createElement('button');
    btnContinuar.textContent = 'Continuar';
    btnContinuar.className = 'btn-continuar';
    btnContinuar.disabled = true;
    btnContinuar.addEventListener('click', () => {
        if (seleccionados.size === 0) {
            alert('Selecciona al menos un asiento.');
            return;
        }
        const urlParams = new URLSearchParams();
        urlParams.set('pelicula', idPelicula);
        urlParams.set('funcion', idFuncion);
        urlParams.set('asientos', Array.from(seleccionados).join(','));
        if (params.get('invitado') === '1') {
            urlParams.set('invitado', '1');
        }
        window.location.href = `entradas.html?${urlParams.toString()}`;
    });
    container.appendChild(btnContinuar);

    // --- Lógica de selección ---
    let seleccionados = new Set();
    const MAX_SELECCION = 10;

    function actualizarSeleccion() {
        // Actualiza lista de butacas seleccionadas
        const lista = Array.from(seleccionados).map(id => {
            const obj = asientosPlano.find(a => a.id == id);
            return obj ? `${obj.fila}${obj.numero}` : '';
        }).filter(Boolean);
        seleccionadasDiv.querySelector('.butacas-lista').textContent = lista.join(', ') || '-';
        btnContinuar.disabled = seleccionados.size === 0;
    }

    // --- Estilos dinámicos para la grilla (solo una vez) ---
    // Elimina este bloque, ya que todo el CSS está en asientos.css
    // if (!document.getElementById('asientos-grilla-style')) {
    //     const style = document.createElement('style');
    //     style.id = 'asientos-grilla-style';
    //     style.textContent = `
    //     .pantalla-cine {
    //         text-align: center;
    //         margin: 0 auto 24px auto;
    //         padding-top: 12px;
    //         position: relative;
    //     }
    //     .pantalla-cine .pantalla-texto {
    //         font-size: 2em;
    //         font-family: 'Montserrat', sans-serif;
    //         color: #c2c7d0;
    //         font-weight: 900;
    //         letter-spacing: 0.04em;
    //         margin-bottom: 0.2em;
    //         opacity: 0.7;
    //     }
    //     .pantalla-cine .pantalla-barra {
    //         width: 90%;
    //         max-width: 520px;
    //         height: 12px;
    //         background: #fff;
    //         margin: 0 auto;
    //         border-radius: 4px 4px 12px 12px;
    //         box-shadow: 0 8px 32px 0 #e7ecf0;
    //     }
    //     .grilla-asientos {
    //         display: flex;
    //         flex-direction: column;
    //         align-items: center;
    //         margin-bottom: 18px;
    //     }
    //     .fila-asientos {
    //         display: flex;
    //         align-items: center;
    //         margin: 2px 0;
    //     }
    //     .fila-letra-grilla {
    //         width: 22px;
    //         text-align: center;
    //         color: #7a8ba7;
    //         font-weight: bold;
    //         font-size: 1.1em;
    //         font-family: 'Montserrat', sans-serif;
    //         opacity: 0.85;
    //     }
    //     .asiento-circulo {
    //         width: 28px;
    //         height: 28px;
    //         border-radius: 50%;
    //         border: 2px solid #1976d2;
    //         background: #fafdff;
    //         margin: 0 3px;
    //         display: inline-flex;
    //         align-items: center;
    //         justify-content: center;
    //         cursor: pointer;
    //         transition: border 0.15s, background 0.15s;
    //         font-size: 1.1em;
    //         color: #1976d2;
    //         position: relative;
    //     }
    //     .asiento-circulo.asiento-vacio {
    //         border: none;
    //         background: transparent;
    //         cursor: default;
    //     }
    //     .asiento-circulo.ocupado {
    //         border: 2px solid #e53935;
    //         background: #e53935;
    //         color: #fff;
    //         cursor: not-allowed;
    //     }
    //     .asiento-circulo.seleccionado {
    //         border: 2.5px solid #0d47a1;
    //         background: #1976d2;
    //         color: #fff;
    //     }
    //     .asiento-circulo.discapacidad {
    //         border: 2px solid #1976d2;
    //         background: #e3f2fd;
    //         color: #1976d2;
    //     }
    //     .asiento-circulo.discapacidad i {
    //         font-size: 1em;
    //     }
    //     .leyenda-grilla {
    //         margin: 18px 0 8px 0;
    //         font-size: 1em;
    //         color: #4a5a6a;
    //         display: flex;
    //         align-items: center;
    //         gap: 18px;
    //         flex-wrap: wrap;
    //     }
    //     .leyenda-grilla .asiento-circulo {
    //         margin-right: 6px;
    //         margin-left: 0;
    //     }
    //     .leyenda-grilla .leyenda.disponible {
    //         border: 2px solid #1976d2;
    //         background: #fff;
    //     }
    //     .leyenda-grilla .leyenda.ocupado {
    //         border: 2px solid #e53935;
    //         background: #e53935;
    //     }
    //     .leyenda-grilla .leyenda.seleccionada {
    //         border: 2.5px solid #0d47a1;
    //         background: #1976d2;
    //     }
    //     .leyenda-grilla .leyenda.discapacidad {
    //         border: 2px solid #1976d2;
    //         background: #e3f2fd;
    //         color: #1976d2;
    //     }
    //     .accesibilidad-msg {
    //         margin: 0 0 18px 0;
    //         font-size: 0.98em;
    //         color: #7a8ba7;
    //         display: flex;
    //         align-items: center;
    //         gap: 6px;
    //     }
    //     .accesibilidad-msg i {
    //         margin-right: 6px;
    //     }
    //     .butacas-seleccionadas {
    //         margin: 18px 0 8px 0;
    //         font-size: 1.1em;
    //         color: #092058;
    //         font-family: 'Montserrat', sans-serif;
    //     }
    //     .butacas-seleccionadas .butacas-lista {
    //         font-weight: bold;
    //         margin-left: 8px;
    //     }
    //     .btn-continuar {
    //         display: block;
    //         margin: 18px auto 0 auto;
    //         padding: 0.7em 2.5em;
    //         font-size: 1.15em;
    //         font-family: 'Montserrat', sans-serif;
    //         background: #c2c7d0;
    //         color: #fff;
    //         border: none;
    //         border-radius: 32px;
    //         box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.08);
    //         cursor: pointer;
    //         transition: background 0.2s, opacity 0.2s;
    //         opacity: 1;
    //     }
    //     .btn-continuar:not(:disabled) {
    //         background: #D70242;
    //     }
    //     .btn-continuar:disabled {
    //         background: #c2c7d0;
    //         color: #fff;
    //         cursor: not-allowed;
    //         opacity: 0.7;
    //     }
    //     @media (max-width: 900px) {
    //         .pantalla-cine .pantalla-barra { width: 98%; }
    //         .grilla-asientos { margin-bottom: 10px; }
    //         .leyenda-grilla { font-size: 0.98em; gap: 10px; }
    //         .butacas-seleccionadas { font-size: 1em; }
    //         .btn-continuar { font-size: 1em; padding: 0.6em 1.5em; }
    //     }
    //     `;
    //     document.head.appendChild(style);
    // }
});
