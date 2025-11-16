// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

// customer creates order (public)
router.post("/", orderController.createOrder);

// admin views + updates
router.get("/", auth, orderController.getAllOrders);
router.put("/:id/status", auth, orderController.updateOrderStatus);

module.exports = router;
