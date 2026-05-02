document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Limpiar errores anteriores
    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    document.getElementById('successMessage').style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/signIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token en sessionStorage
            sessionStorage.setItem('token', data.token);
            
            // Obtener datos del usuario para verificar rol
            const userResponse = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                
                // Redirigir según el rol
                if (userData.roles.includes('admin')) {
                    window.location.href = '/admin-dashboard';
                } else {
                    window.location.href = '/user-dashboard';
                }
            } else {
                window.location.href = '/user-dashboard';
            }
        } else {
            // Mostrar error
            document.getElementById('generalError').textContent = data.message || 'Error al iniciar sesión';
            document.getElementById('generalError').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('generalError').textContent = 'Error de conexión. Inténtalo de nuevo.';
        document.getElementById('generalError').style.display = 'block';
    }
});
