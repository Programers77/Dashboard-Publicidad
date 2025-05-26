document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const welcomeUser = document.getElementById('welcomeUser');
    const errorMessage = document.getElementById('errorMessage');
    
    // 1. Función para mostrar/ocultar contraseña (sin cambios)
    togglePassword.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        this.querySelector('.eye-icon').textContent = isPassword ? '🙈' : '👀';
        this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
    
    // 2. Función para mostrar pantalla de carga (sin cambios)
    function showWelcome(username) {
        welcomeUser.textContent = username;
        loadingOverlay.classList.add('active');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    }
    
    // 3. Función para mostrar errores elegantes (sin cambios)
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // 4. Función para manejar el login (sin cambios)
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
                storage.setItem('token', data.token);
                
                console.log('Token guardado:', data.token);
                showWelcome(data.username);
            } else {
                showError('Credenciales incorrectas. Por favor verifica tus datos.');
            }
        } catch (error) {
            console.error('Error en la autenticación:', error);
            showError('Error de conexión. Por favor intenta nuevamente.');
        }
    });
    
    // 5. Verificar sesión existente al cargar (modificado solo para exportar funciones)
    function checkSession() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('logout')) {
            localStorage.clear();
            sessionStorage.clear();
            history.replaceState(null, null, window.location.pathname);
            return;
        }
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        
        fetch('http://10.100.39.23:8000/api/verifed/', {
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
                localStorage.clear();
                sessionStorage.clear();
            }
        })
        .catch(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    }
    
    // 6. Limpiar error al empezar a escribir (sin cambios)
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (errorMessage.style.display === 'block') {
                errorMessage.style.display = 'none';
            }
        });
    });

    // Verificar sesión al cargar (sin cambios)
    checkSession();
    
    // 7. Nuevo: Exportar funciones para protección de rutas (única adición)
    window.authUtils = {
        verifySession: async function() {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return false;
            
            try {
                const response = await fetch('http://10.100.39.23:8000/api/verifed/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.ok;
            } catch (error) {
                console.error('Error verifying token:', error);
                return false;
            }
        },
        redirectIfNotAuthenticated: async function() {
            const isAuthenticated = await this.verifySession();
            if (!isAuthenticated) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/dashboard';
            }
        }
    };
});