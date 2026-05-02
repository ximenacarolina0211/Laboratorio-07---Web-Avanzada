import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import '../models/Role.js';

export default async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) 
            return res.status(401).json({ message: 'No autorizado' });

        const token = header.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub).populate('roles').exec();

        if (!user) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        req.userId = payload.sub;
        req.userRoles = user.roles.map(role => role.name);
        next();

    } catch (err) {
        return res.status(401).json({ message: 'Token no válido o caducado' });
    }
}
