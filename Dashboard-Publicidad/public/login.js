document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const welcomeUser = document.getElementById('welcomeUser');
    const errorMessage = document.getElementById('errorMessage');
    
    // 1. Función para mostrar/ocultar contraseña
    togglePassword.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        this.querySelector('.eye-icon').textContent = isPassword ? '🙈' : '👀';
        this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
    
    // 2. Función para mostrar pantalla de carga (solo para login exitoso)
    function showWelcome(username) {
        welcomeUser.textContent = username;
        loadingOverlay.classList.add('active');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    }
    
    // 3. Función para mostrar errores elegantes
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // 4. Función para manejar el login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = document.getElementById('remember').checked;
        
        // Validación básica
        if (!username || !password) {
            showError('Por favor completa todos los campos');
            return;
        }
        
        try {
            const response = await fetch('http://10.100.39.23:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Guardar datos de sesión
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('user_id', data.user_id);
                storage.setItem('username', data.username);
                storage.setItem('token', data.token); // Guardar el token
    
                // Mostrar el token por consola
                console.log('Token guardado:', data.token);
                
                // Mostrar pantalla de bienvenida
                showWelcome(data.username);
            } else {
                showError('Credenciales incorrectas. Por favor verifica tus datos.');
            }
        } catch (error) {
            console.error('Error en la autenticación:', error);
            showError('Error de conexión. Por favor intenta nuevamente.');
        }
    });
    
    // 5. Verificar sesión existente al cargar - VERSIÓN MODIFICADA
    function checkSession() {
        // Primero verificar si viene de un logout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('logout')) {
            // Limpieza adicional por si acaso
            localStorage.clear();
            sessionStorage.clear();
            // Eliminar parámetros de la URL
            history.replaceState(null, null, window.location.pathname);
            return;
        }
        
        // Verificar token de forma más estricta
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        
        // Si hay token, verificar su validez con el backend
        fetch('http://10.100.39.23:8000/api/verify_token/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
                if (userId) {
                    const username = localStorage.getItem('username') || sessionStorage.getItem('username');
                    showWelcome(username);
                }
            } else {
                // Token inválido, limpiar
                localStorage.clear();
                sessionStorage.clear();
            }
        })
        .catch(() => {
            // Error de conexión, no auto-login
            localStorage.clear();
            sessionStorage.clear();
        });
    }
    
    checkSession();
    
    // 6. Limpiar error al empezar a escribir
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (errorMessage.style.display === 'block') {
                errorMessage.style.display = 'none';
            }
        });
    });
});