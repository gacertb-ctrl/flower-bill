const bcrypt = require('bcryptjs');

// Get Organization Details
exports.getOrgDetails = async (req, res) => {
    try {
        const [rows] = await req.conn.execute("SELECT name, logo_url, address FROM organizations WHERE id = ?", [req.user.organization_id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Update Organization (Admin Only)
exports.updateOrgDetails = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { name, logo_url, address } = req.body;
    try {
        await req.conn.execute("UPDATE organizations SET name = ?, logo_url = ?, address = ? WHERE id = ?",
            [name, logo_url, address, req.user.organization_id]);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Change Password (Universal)
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [users] = await req.conn.execute("SELECT * FROM users WHERE user_id = ?", [req.user.id]);
        const user = users[0];

        const validPass = await bcrypt.compare(currentPassword, user.password);
        if (!validPass) return res.status(400).json({ error: "Invalid current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        await req.conn.execute("UPDATE users SET password = ? WHERE user_id = ?", [hashedPass, req.user.id]);
        res.json({ message: "Password changed successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};