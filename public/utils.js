// Utilidades comunes para el frontend

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = '/signin';
}

async function goToAdmin(event) {
    event.preventDefault();

    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
        return;
    }

    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            sessionStorage.removeItem('token');
            window.location.href = '/signin';
            return;
        }

        const user = await response.json();
        if (user.roles?.includes('admin')) {
            window.location.href = '/admin-dashboard';
            return;
        }

        alert('No tienes permisos de administrador.');
    } catch (error) {
        console.error('Error al validar rol admin:', error);
        alert('No se pudo validar tu acceso de administrador.');
    }
}

function checkAuth() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
        return false;
    }
    return true;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return /^\d{9}$/.test(cleaned);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function hideSuccess(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

// Función para hacer peticiones con autenticación
async function authFetch(url, options = {}) {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/signin';
        return;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            sessionStorage.removeItem('token');
            window.location.href = '/signin';
            return;
        }
        
        return response;
    } catch (error) {
        console.error('Error en petición autenticada:', error);
        throw error;
    }
}

// Exportar funciones para uso en otros scripts
window.utils = {
    logout,
    goToAdmin,
    checkAuth,
    formatDate,
    calculateAge,
    validateEmail,
    validatePhone,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    authFetch
};
