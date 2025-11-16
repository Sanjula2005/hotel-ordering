// backend/controllers/adminController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// helper endpoint to hash the initial admin password once
exports.setAdminPassword = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query("UPDATE admins SET password = $1 WHERE username = $2 RETURNING id", [
      hash,
      username,
    ]);
    if (result.rowCount === 0) return res.status(400).json({ message: "Admin not found" });
    res.json({ message: "Password updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};
