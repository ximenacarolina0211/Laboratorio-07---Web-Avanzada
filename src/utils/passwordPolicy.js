export function validatePassword(password) {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('mínimo 8 caracteres');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('una letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('una letra mayúscula');
    }

    if (!/\d/.test(password)) {
        errors.push('un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;']/.test(password)) {
        errors.push('un símbolo');
    }

    return {
        isValid: errors.length === 0,
        message: errors.length === 0
            ? ''
            : `La contraseña debe tener ${errors.join(', ')}.`
    };
}
