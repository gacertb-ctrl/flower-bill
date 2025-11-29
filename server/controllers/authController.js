// server/controllers/authController.js
const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    // try {
        const { username, password } = req.body;
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if user exists
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        console.log(users);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('JWT_SECRET:', { id: user.user_id, username: user.username, role: user.role });
        // Generate JWT tokens
        const token = jwt.sign(
            { id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data without password
        const userData = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        };

        res.json({ token, refreshToken, user: userData });
    // } catch (err) {
    //     res.status(500).json({ error: err.message });
    // }
};

exports.checkAuth = async (req, res) => {
    try {
        // If middleware passed, user is authenticated
        res.json({
            user: req.user,
            isAuthenticated: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }

            // Generate new access token
            const token = jwt.sign(
                { id: decoded.id, username: decoded.username, role: decoded.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    // Implement token invalidation logic if needed
    res.json({ message: 'Logged out successfully' });
};