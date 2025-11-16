// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { loginAdmin, setAdminPassword } = require("../controllers/adminController");

// POST /api/admin/login
router.post("/login", loginAdmin);

// one-time use (you can disable later)
router.post("/set-password", setAdminPassword);

module.exports = router;
