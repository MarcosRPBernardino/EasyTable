const bcrypt = require("bcrypt");
const { dbGet } = require("../db/sqliteHelpers");

async function loginManager(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    try {
        const sql =
            `SELECT id, full_name, email, password_hash
            FROM managers
            WHERE email = ?`;

        const manager = await dbGet(sql, [email]);

        if (!manager) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const passwordMatch = await bcrypt.compare(password, manager.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        return res.status(200).json({
            message: "Login successful",
            manager: {
                id: manager.id,
                full_name: manager.full_name,
                email: manager.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Database error",
        });
    }
}

module.exports = {
    loginManager,
};