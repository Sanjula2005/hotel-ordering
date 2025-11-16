// backend/routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const auth = require("../middleware/auth");

// public
router.get("/", menuController.getMenu);

// protected (admin)
router.post("/", auth, menuController.createMenuItem);
router.put("/:id", auth, menuController.updateMenuItem);
router.delete("/:id", auth, menuController.deleteMenuItem);

module.exports = router;
