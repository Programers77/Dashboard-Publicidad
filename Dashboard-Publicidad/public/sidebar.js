document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if(!confirm('¿Estás seguro que deseas cerrar sesión?')) return;
        
        // Mostrar loader
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando...';
        logoutBtn.disabled = true;
        
        try {
            // 1. Obtener token antes de eliminarlo
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // 2. Limpiar TODO inmediatamente
            localStorage.clear();
            sessionStorage.clear();
            
            // 3. Eliminar cookies específicas de sesión
            document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // 4. Notificar al backend (pero no esperar si falla)
            if (token) {
                fetch("http://172.21.250.10:8000/api/logout/", {
                  method: "POST",
                  headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                  },
                }).catch((e) => console.error("Error en logout API:", e));
            }
            
            // 5. Redirigir con parámetros para evitar cache
            window.location.href = '/index.html?logout=true&t=' + Date.now();
            
        } catch (error) {
            console.error('Error en logout:', error);
            // Redirigir igual aunque falle
            window.location.href = '/index.html?logout=force';
        }
    });
});