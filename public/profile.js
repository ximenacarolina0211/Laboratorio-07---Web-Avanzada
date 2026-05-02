document.addEventListener('DOMContentLoaded', async () => {
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
            throw new Error('No autorizado');
        }

        const user = await response.json();
        document.getElementById('name').value = user.name || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('phoneNumber').value = user.phoneNumber || '';
        document.getElementById('birthdate').value = user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '';
        document.getElementById('email').value = user.email || '';

        const initials = `${user.name?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('userName').textContent = [user.name, user.lastName].filter(Boolean).join(' ') || 'Usuario';
    } catch (error) {
        console.error('Error:', error);
        sessionStorage.removeItem('token');
        window.location.href = '/signin';
    }
});

function validateStrongPassword(password) {
    const errors = [];

    if (!password || password.length < 8) errors.push('mínimo 8 caracteres');
    if (!/[a-z]/.test(password)) errors.push('una letra minúscula');
    if (!/[A-Z]/.test(password)) errors.push('una letra mayúscula');
    if (!/\d/.test(password)) errors.push('un número');
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;']/.test(password)) errors.push('un símbolo');

    return {
        isValid: errors.length === 0,
        message: errors.length === 0
            ? ''
            : `La contraseña debe tener ${errors.join(', ')}.`
    };
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';
        return;
    }

    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    document.getElementById('successMessage').style.display = 'none';

    const formData = {
        name: document.getElementById('name').value,
        lastName: document.getElementById('lastName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        birthdate: document.getElementById('birthdate').value,
        email: document.getElementById('email').value,
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    let hasError = false;

    if (!formData.name || formData.name.trim().length < 2) {
        document.getElementById('nameError').textContent = 'El nombre debe tener al menos 2 caracteres';
        document.getElementById('nameError').style.display = 'block';
        hasError = true;
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
        document.getElementById('lastNameError').textContent = 'El apellido debe tener al menos 2 caracteres';
        document.getElementById('lastNameError').style.display = 'block';
        hasError = true;
    }

    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
    if (!/^\d{9}$/.test(phoneDigits)) {
        document.getElementById('phoneError').textContent = 'El teléfono debe tener exactamente 9 dígitos';
        document.getElementById('phoneError').style.display = 'block';
        hasError = true;
    }

    if (!formData.birthdate) {
        document.getElementById('birthdateError').textContent = 'La fecha de nacimiento es requerida';
        document.getElementById('birthdateError').style.display = 'block';
        hasError = true;
    } else {
        const birthDate = new Date(formData.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18 || age > 120) {
            document.getElementById('birthdateError').textContent = 'Debes ser mayor de 18 años';
            document.getElementById('birthdateError').style.display = 'block';
            hasError = true;
        }
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        document.getElementById('emailError').textContent = 'Ingresa un correo electrónico válido';
        document.getElementById('emailError').style.display = 'block';
        hasError = true;
    }

    if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
            document.getElementById('currentPasswordError').textContent = 'Debes ingresar tu contraseña actual para cambiarla';
            document.getElementById('currentPasswordError').style.display = 'block';
            hasError = true;
        }

        const passwordValidation = validateStrongPassword(formData.newPassword);
        if (!passwordValidation.isValid) {
            document.getElementById('newPasswordError').textContent = passwordValidation.message;
            document.getElementById('newPasswordError').style.display = 'block';
            hasError = true;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Las contraseñas no coinciden';
            document.getElementById('confirmPasswordError').style.display = 'block';
            hasError = true;
        }
    }

    if (hasError) return;

    try {
        document.getElementById('successMessage').textContent = '¡Perfil actualizado exitosamente!';
        document.getElementById('successMessage').style.display = 'block';

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        const initials = `${formData.name.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('userName').textContent = `${formData.name} ${formData.lastName}`;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('generalError').textContent = 'Error al actualizar el perfil. Inténtalo de nuevo.';
        document.getElementById('generalError').style.display = 'block';
    }
});

function cancelEdit() {
    window.location.href = '/user-dashboard';
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = '/signin';
}
