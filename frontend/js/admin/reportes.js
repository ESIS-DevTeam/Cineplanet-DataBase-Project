import BASE_API_DOMAIN from '../config.js';

function mostrarAlerta(mensaje, tipo) {
    const alert = tipo === 'success' ? document.getElementById('successAlert') : document.getElementById('errorAlert');
    if (!alert) return;
    alert.textContent = mensaje;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 4000);
}

window.cargarReporte = async function() {
    const tipo = document.getElementById('reporteTipo').value;
    const container = document.getElementById('tablaReporteResultados');
    container.innerHTML = '⏳ Cargando...';

    let endpoint = '';
    if (tipo === 'reservas') {
        endpoint = BASE_API_DOMAIN + 'reportes/reservas_vigentes_hoy_por_sala.php';
    } else if (tipo === 'productos') {
        endpoint = BASE_API_DOMAIN + 'reportes/productos_mas_vendidos_mes.php';
    } else if (tipo === 'promos') {
        endpoint = BASE_API_DOMAIN + 'reportes/promociones_mas_usadas_mes.php';
    } else {
        container.innerHTML = '<div class="empty-state"><p>❌ Reporte no soportado</p></div>';
        return;
    }

    try {
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
            if (tipo === 'reservas') {
                container.innerHTML = `
                    <table class="catalogo-table">
                        <thead>
                            <tr>
                                <th>Sala</th>
                                <th>Reservas</th>
                                <th>Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${json.data.map(r => `
                                <tr>
                                    <td>${r.sala}</td>
                                    <td>${r.reservas}</td>
                                    <td>S/. ${parseFloat(r.ingresos).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (tipo === 'productos') {
                container.innerHTML = `
                    <table class="catalogo-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad Vendida</th>
                                <th>Total Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${json.data.map(p => `
                                <tr>
                                    <td>${p.producto}</td>
                                    <td>${p.cantidad_vendida}</td>
                                    <td>S/. ${parseFloat(p.total_ingresos).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (tipo === 'promos') {
                container.innerHTML = `
                    <table class="catalogo-table">
                        <thead>
                            <tr>
                                <th>Promoción</th>
                                <th>Veces Usada</th>
                                <th>Total Descuento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${json.data.map(p => `
                                <tr>
                                    <td>${p.promocion}</td>
                                    <td>${p.veces_usada}</td>
                                    <td>S/. ${parseFloat(p.total_descuento).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } else {
            container.innerHTML = '<div class="empty-state"><p>📭 No hay datos para mostrar</p></div>';
        }
    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>❌ Error al cargar reporte</p></div>';
        mostrarAlerta('❌ Error al cargar reporte', 'error');
    }
};
