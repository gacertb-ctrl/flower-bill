const bcrypt = require('bcryptjs');

exports.getAllStaff = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    // Only fetch staff belonging to THIS admin's organization
    const [rows] = await req.conn.execute("SELECT user_id, username, role, user_last_update_time as created_at FROM users WHERE organization_id = ? AND role = 'staff'", [req.user.organization_id]);
    res.json(rows);
};

exports.createStaff = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    try {
        await req.conn.execute("INSERT INTO users (username, password, role, organization_id) VALUES (?, ?, 'staff', ?)",
            [username, hashed, req.user.organization_id]);
        res.json({ message: "Staff user created" });
    } catch (err) { res.status(500).json({ error: "Error creating user" }); }
};

exports.deleteStaff = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    // Ensure we only delete users from OUR organization
    await req.conn.execute("DELETE FROM users WHERE user_id = ? AND organization_id = ?", [req.params.id, req.user.organization_id]);
    res.json({ message: "Staff deleted" });
};