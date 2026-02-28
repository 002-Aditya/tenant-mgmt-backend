const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const logger = require('../middlewares/logger');

class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            const user = await User.create({ name, email, password });

            logger.info(`New user registered: ${email}`);
            res.status(201).json({
                success: true,
                data: { id: user.id, name: user.name, email: user.email }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide email and password' });
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'your_super_secret_jwt_key',
                { expiresIn: '1d' }
            );

            logger.info(`User logged in: ${email}`);
            res.status(200).json({
                success: true,
                token,
                data: { id: user.id, name: user.name, email: user.email }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
