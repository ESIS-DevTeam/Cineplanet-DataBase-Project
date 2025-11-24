document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[action="../../backend/auth/registro.php"]');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);

        // Reemplaza los valores por los nombres seleccionados
        const departamentoSelect = document.getElementById('departamentoSelect');
        const provinciaSelect = document.getElementById('provinciaSelect');
        const distritoSelect = document.getElementById('distritoSelect');
        const cineplanetFavoritoSelect = document.getElementById('cineplanetFavoritoSelect');

        // Obtiene el nombre visible del select
        const departamentoNombre = departamentoSelect.options[departamentoSelect.selectedIndex]?.textContent || '';
        const provinciaNombre = provinciaSelect.options[provinciaSelect.selectedIndex]?.textContent || '';
        const distritoNombre = distritoSelect.options[distritoSelect.selectedIndex]?.textContent || '';
        const cineplanetFavoritoNombre = cineplanetFavoritoSelect.options[cineplanetFavoritoSelect.selectedIndex]?.textContent || '';

        formData.set('departamento', departamentoNombre);
        formData.set('provincia', provinciaNombre);
        formData.set('distrito', distritoNombre);
        formData.set('cineplanetFavorito', cineplanetFavoritoNombre);

        try {
            const response = await fetch('../../backend/auth/registro.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                // Opcional: redirigir o limpiar el formulario
                // window.location.href = 'login.html';
            } else if (
                typeof result.message === 'string' &&
                result.message.includes('Duplicate entry') &&
                result.message.includes('email')
            ) {
                alert('Este correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.');
            } else {
                alert('Error: ' + (result.message || 'No se pudo registrar.'));
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
            console.error(error);
        }
    });
});
