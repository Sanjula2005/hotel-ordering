// backend/controllers/orderController.js
const pool = require("../config/db");

exports.createOrder = async (req, res) => {
  const { table_number, items } = req.body; // items = [{menu_item_id, quantity}]
  if (!table_number || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (table_number) VALUES ($1) RETURNING *",
      [table_number]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES ($1,$2,$3)",
        [order.id, item.menu_item_id, item.quantity]
      );
    }

    await client.query("COMMIT");

    // 🔔 Notify all connected admin dashboards
    const io = req.app.get("io");
    if (io) {
      io.emit("newOrder", {
        orderId: order.id,
        tableNumber: order.table_number,
        createdAt: order.created_at,
      });
    }

    res.status(201).json({ order_id: order.id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const ordersRes = await pool.query(
  "SELECT * FROM orders WHERE status != 'completed' ORDER BY created_at DESC"
);

    const orders = ordersRes.rows;

    const orderIds = orders.map((o) => o.id);
    if (orderIds.length === 0) return res.json([]);

    const itemsRes = await pool.query(
      `SELECT oi.*, mi.name, mi.price 
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ANY($1::int[])`,
      [orderIds]
    );

    const itemsByOrder = {};
    itemsRes.rows.forEach((row) => {
      if (!itemsByOrder[row.order_id]) itemsByOrder[row.order_id] = [];
      itemsByOrder[row.order_id].push(row);
    });

    const full = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!["pending", "preparing", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const result = await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });

    const updated = result.rows[0];

    // 🔔 Notify dashboards that an order changed
    const io = req.app.get("io");
    if (io) {
      io.emit("orderUpdated", {
        orderId: updated.id,
        status: updated.status,
      });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
