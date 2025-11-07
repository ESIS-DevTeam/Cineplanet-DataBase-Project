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
        const resInfo = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getInfoFuncionCompleta.php?idFuncion=${idFuncion}`);
        infoFuncion = await resInfo.json();
    } catch {
        // Si falla, muestra error y no dibuja nada
        document.getElementById('asientos-container').textContent = 'Error al obtener la información de la función.';
        return;
    }

    // Mostrar información arriba de los asientos
    const infoDiv = document.createElement('div');
    infoDiv.style.marginBottom = '2em';

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
    const container = document.getElementById('asientos-container');
    container.innerHTML = '';
    container.appendChild(infoDiv);

    // Obtener idSala desde la función
    let idSala = infoFuncion.idSala;
    if (!idSala) {
        container.textContent = 'Error al obtener la sala de la función.';
        return;
    }

    // Obtener asientos del plano de la sala
    let asientosPlano = [];
    try {
        const resPlano = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getPlanoSalaPorSala.php?idSala=${idSala}`);
        asientosPlano = await resPlano.json();
    } catch {
        container.textContent = 'Error al obtener el plano de sala.';
        return;
    }

    // Opcional: obtener ocupados para la función
    let ocupados = new Set();
    try {
        const resOcupados = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getAsientosOcupadosPorFuncion.php?idFuncion=${idFuncion}`);
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

    // Selección de asientos
    let seleccionados = new Set();
    const MAX_SELECCION = 10;

    // Dibuja la grilla de asientos
    for (const fila of filas) {
        const filaDiv = document.createElement('div');
        const filaLetra = document.createElement('span');
        filaLetra.className = 'fila-letra';
        filaLetra.textContent = fila;
        filaDiv.appendChild(filaLetra);

        for (const numero of columnas) {
            const asientoObj = asientosPlano.find(a => a.fila === fila && a.numero == numero);
            if (!asientoObj) {
                const espacio = document.createElement('div');
                espacio.className = 'asiento';
                espacio.style.visibility = 'hidden';
                filaDiv.appendChild(espacio);
                continue;
            }
            if (asientoObj.tipo === 'pasillo') {
                const espacio = document.createElement('div');
                espacio.className = 'asiento';
                espacio.style.visibility = 'hidden';
                filaDiv.appendChild(espacio);
                continue;
            }

            const asientoDiv = document.createElement('div');
            asientoDiv.className = 'asiento tipo-' + asientoObj.tipo;
            // Mostrar el número del plano (no lógica)
            asientoDiv.textContent = asientoObj.numero;
            asientoDiv.dataset.idPlanoSala = asientoObj.id;

            if (ocupados.has(asientoObj.id)) {
                asientoDiv.classList.add('ocupado');
            } else {
                // Selección de asientos
                asientoDiv.addEventListener('click', () => {
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
                    actualizarBotonContinuar();
                });
            }

            filaDiv.appendChild(asientoDiv);
        }
        container.appendChild(filaDiv);
    }

    // Botón continuar
    const btnContinuar = document.createElement('button');
    btnContinuar.textContent = 'Continuar';
    btnContinuar.style.margin = '2em auto 1em auto';
    btnContinuar.style.padding = '0.7em 2em';
    btnContinuar.style.fontSize = '1.1em';
    btnContinuar.style.cursor = 'pointer';
    btnContinuar.disabled = true; // deshabilitado por defecto

    btnContinuar.addEventListener('click', () => {
        if (seleccionados.size === 0) {
            alert('Selecciona al menos un asiento.');
            return;
        }
        // Construir URL con ids de asientos seleccionados, funcion y pelicula
        const urlParams = new URLSearchParams();
        urlParams.set('pelicula', idPelicula);
        urlParams.set('funcion', idFuncion);
        urlParams.set('asientos', Array.from(seleccionados).join(','));
        window.location.href = `entradas.html?${urlParams.toString()}`;
    });

    container.appendChild(btnContinuar);

    function actualizarBotonContinuar() {
        btnContinuar.disabled = seleccionados.size === 0;
    }
});
