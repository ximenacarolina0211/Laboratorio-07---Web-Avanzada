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
        const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || 'Usuario';
        const isAdmin = user.roles?.includes('admin');

        document.getElementById('userName').textContent = fullName;
        document.getElementById('userEmail').textContent = user.email || 'No registrado';
        document.getElementById('userPhone').textContent = user.phoneNumber || 'No registrado';

        if (user.birthdate) {
            const birthDate = new Date(user.birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            document.getElementById('userAge').textContent = `${age} años`;
        } else {
            document.getElementById('userAge').textContent = 'No registrada';
        }

        document.getElementById('userRole').textContent = isAdmin ? 'Administrador' : 'Usuario';

        const initials = `${user.name?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
        document.getElementById('userAvatar').textContent = initials;
    } catch (error) {
        console.error('Error:', error);
        sessionStorage.removeItem('token');
        window.location.href = '/signin';
    }
});

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = '/signin';
}
