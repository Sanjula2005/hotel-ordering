// backend/controllers/menuController.js
const pool = require("../config/db");

exports.getMenu = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createMenuItem = async (req, res) => {
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_available)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, description, price, category, image_url || null, is_available ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  const id = req.params.id;
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items
       SET name=$1, description=$2, price=$3, category=$4, image_url=$5, is_available=$6
       WHERE id=$7 RETURNING *`,
      [name, description, price, category, image_url || null, is_available, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM menu_items WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
