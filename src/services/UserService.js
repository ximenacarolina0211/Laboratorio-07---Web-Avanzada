import userRepository from '../repositories/UserRepository.js';

class UserService {
    getRoleNames(roles = []) {
        return roles
            .map(role => role?.name)
            .filter(Boolean);
    }

    async getAll() {
        const users = await userRepository.getAll();
        return users.map(user => ({
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            roles: this.getRoleNames(user.roles),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            roles: this.getRoleNames(user.roles)
        };
    }
}

export default new UserService();
