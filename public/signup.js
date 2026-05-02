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

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        lastName: document.getElementById('lastName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        birthdate: document.getElementById('birthdate').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    document.getElementById('successMessage').style.display = 'none';

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

    const passwordValidation = validateStrongPassword(formData.password);
    if (!passwordValidation.isValid) {
        document.getElementById('passwordError').textContent = passwordValidation.message;
        document.getElementById('passwordError').style.display = 'block';
        hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Las contraseñas no coinciden';
        document.getElementById('confirmPasswordError').style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await fetch('/api/auth/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                lastName: formData.lastName,
                phoneNumber: phoneDigits,
                birthdate: formData.birthdate,
                email: formData.email,
                password: formData.password,
                roles: ['user']
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('successMessage').textContent = '¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...';
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('signupForm').reset();

            setTimeout(() => {
                window.location.href = '/signin';
            }, 2000);
        } else {
            document.getElementById('generalError').textContent = data.message || 'Error al crear la cuenta';
            document.getElementById('generalError').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('generalError').textContent = 'Error de conexión. Inténtalo de nuevo.';
        document.getElementById('generalError').style.display = 'block';
    }
});
