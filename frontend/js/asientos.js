document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idFuncion = params.get('funcion');
    if (!idFuncion) {
        document.getElementById('asientos-container').textContent = 'No se ha seleccionado función.';
        return;
    }

    // Obtener idSala desde la función
    let idSala = null;
    try {
        const resFuncion = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getFuncion.php?id=${idFuncion}`);
        const funcion = await resFuncion.json();
        idSala = funcion.idSala;
    } catch {
        document.getElementById('asientos-container').textContent = 'Error al obtener la función.';
        return;
    }

    // Obtener asientos del plano de la sala
    let asientosPlano = [];
    try {
        const resPlano = await fetch(`http://localhost/Cineplanet-DataBase-Project/backend/api/getPlanoSalaPorSala.php?idSala=${idSala}`);
        asientosPlano = await resPlano.json();
    } catch {
        document.getElementById('asientos-container').textContent = 'Error al obtener el plano de sala.';
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

    const container = document.getElementById('asientos-container');
    container.innerHTML = '';

    for (const fila of filas) {
        const filaDiv = document.createElement('div');
        const filaLetra = document.createElement('span');
        filaLetra.className = 'fila-letra';
        filaLetra.textContent = fila;
        filaDiv.appendChild(filaLetra);

        for (const numero of columnas) {
            const asientoObj = asientosPlano.find(a => a.fila === fila && a.numero == numero);
            if (!asientoObj) {
                // Si no existe asiento, dibuja espacio vacío
                const espacio = document.createElement('div');
                espacio.className = 'asiento';
                espacio.style.visibility = 'hidden';
                filaDiv.appendChild(espacio);
                continue;
            }
            if (asientoObj.tipo === 'pasillo') {
                // Dibuja espacio vacío para el pasillo
                const espacio = document.createElement('div');
                espacio.className = 'asiento';
                espacio.style.visibility = 'hidden';
                filaDiv.appendChild(espacio);
                continue;
            }

            const asientoDiv = document.createElement('div');
            asientoDiv.className = 'asiento tipo-' + asientoObj.tipo;
            asientoDiv.textContent = numero;
            asientoDiv.dataset.idPlanoSala = asientoObj.id;

            if (ocupados.has(asientoObj.id)) {
                asientoDiv.classList.add('ocupado');
            }

            filaDiv.appendChild(asientoDiv);
        }
        container.appendChild(filaDiv);
    }
});
