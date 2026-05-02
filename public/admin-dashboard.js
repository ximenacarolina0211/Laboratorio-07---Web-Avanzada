let loadedUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
        window.location.href = '/signin';
        return;
    }

    try {
        const userResponse = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('No autorizado');
        }

        const user = await userResponse.json();

        if (!user.roles?.includes('admin')) {
            window.location.href = '/user-dashboard';
            return;
        }

        const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || 'Administrador';
        document.getElementById('userName').textContent = fullName;

        const initials = `${user.name?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';
        document.getElementById('userAvatar').textContent = initials;

        await loadUsers();
    } catch (error) {
        console.error('Error:', error);
        sessionStorage.removeItem('token');
        window.location.href = '/signin';
    }
});

async function loadUsers() {
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        loadedUsers = await response.json();
        updateStats(loadedUsers);
        renderUsersTable(loadedUsers);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--error);">
                    Error al cargar los usuarios. Inténtalo de nuevo.
                </td>
            </tr>
        `;
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No hay usuarios registrados
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        const roles = Array.isArray(user.roles) ? user.roles : [];
        const rolesBadges = roles.map(role =>
            `<span class="role-badge ${escapeHTML(role)}">${escapeHTML(role)}</span>`
        ).join(' ');
        const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || 'Usuario';
        const birthdate = formatDisplayDate(user.birthdate, 'No registrada');
        const createdAt = formatDisplayDate(user.createdAt, '-');

        row.innerHTML = `
            <td>${escapeHTML(user.id || '-')}</td>
            <td>${escapeHTML(fullName)}</td>
            <td>${escapeHTML(user.email || '-')}</td>
            <td>${escapeHTML(user.phoneNumber || '-')}</td>
            <td>${birthdate}</td>
            <td>${rolesBadges || '-'}</td>
            <td>${createdAt}</td>
            <td>
                <button type="button" class="table-action" onclick="showUserDetails('${escapeHTML(user.id || '')}')">
                    Ver
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function showUserDetails(userId) {
    const user = loadedUsers.find(item => item.id === userId);
    if (!user) return;

    const roles = Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles.map(role => `<span class="role-badge ${escapeHTML(role)}">${escapeHTML(role)}</span>`).join(' ')
        : '-';

    const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || 'Usuario';
    document.getElementById('userModalTitle').textContent = fullName;
    document.getElementById('userModalBody').innerHTML = `
        <div class="detail-list">
            <div><span>ID</span><strong>${escapeHTML(user.id || '-')}</strong></div>
            <div><span>Nombre</span><strong>${escapeHTML(fullName)}</strong></div>
            <div><span>Correo</span><strong>${escapeHTML(user.email || '-')}</strong></div>
            <div><span>Teléfono</span><strong>${escapeHTML(user.phoneNumber || '-')}</strong></div>
            <div><span>Fecha de nacimiento</span><strong>${formatDisplayDate(user.birthdate, 'No registrada')}</strong></div>
            <div><span>Roles</span><strong>${roles}</strong></div>
            <div><span>Fecha de registro</span><strong>${formatDisplayDate(user.createdAt, '-')}</strong></div>
            <div><span>Última actualización</span><strong>${formatDisplayDate(user.updatedAt, '-')}</strong></div>
        </div>
    `;

    const modal = document.getElementById('userModal');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function updateStats(users) {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.roles?.includes('admin')).length;
    const regularUsers = totalUsers - adminUsers;
    const today = new Date().toDateString();
    const newUsersToday = users.filter(user =>
        user.createdAt && new Date(user.createdAt).toDateString() === today
    ).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('adminUsers').textContent = adminUsers;
    document.getElementById('regularUsers').textContent = regularUsers;
    document.getElementById('newUsersToday').textContent = newUsersToday;
}

function refreshUsers() {
    document.getElementById('usersTableBody').innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 2rem;">
                Actualizando...
            </td>
        </tr>
    `;
    loadUsers();
}

function formatDisplayDate(value, fallback) {
    return value ? new Date(value).toLocaleDateString('es-ES') : fallback;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = '/signin';
}
