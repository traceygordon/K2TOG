const express = require("express");
const router = express.Router();
const {
  createRating,
  getRatingById,
  getRatingsForOrder,
  getRatingsBySeller,
  getRatingsByBuyer,
  checkIfRatingExists,
  getAverageRatingForUser,
  getRatingStats,
  updateRating,
  deleteRating,
} = require("../controllers/ratings.controller");

// 📥 Create
router.post("/", async (req, res) => {
  try {
    const { seller_id, buyer_id, order_id, stars, review } = req.body;
    const rating = await createRating(seller_id, buyer_id, order_id, stars, review);
    res.status(201).json(rating);
  } catch (err) {
    console.error("Error creating rating:", err);
    res.status(500).json({ error: "Failed to create rating" });
  }
});

// 📤 Read
router.get("/:id", async (req, res) => {
  try {
    const rating = await getRatingById(req.params.id);
    res.json(rating);
  } catch (err) {
    console.error("Error fetching rating by ID:", err);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
});

router.get("/order/:orderId", async (req, res) => {
  try {
    const ratings = await getRatingsForOrder(req.params.orderId);
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings for order:", err);
    res.status(500).json({ error: "Failed to fetch ratings for order" });
  }
});

router.get("/seller/:sellerId", async (req, res) => {
  try {
    const ratings = await getRatingsBySeller(req.params.sellerId);
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings by seller:", err);
    res.status(500).json({ error: "Failed to fetch seller ratings" });
  }
});

router.get("/buyer/:buyerId", async (req, res) => {
  try {
    const ratings = await getRatingsByBuyer(req.params.buyerId);
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings by buyer:", err);
    res.status(500).json({ error: "Failed to fetch buyer ratings" });
  }
});

router.get("/exists", async (req, res) => {
  try {
    const { buyer_id, seller_id, order_id } = req.query;
    const exists = await checkIfRatingExists(buyer_id, seller_id, order_id);
    res.json({ exists });
  } catch (err) {
    console.error("Error checking if rating exists:", err);
    res.status(500).json({ error: "Failed to check rating existence" });
  }
});

router.get("/average/:userId", async (req, res) => {
  try {
    const avg = await getAverageRatingForUser(req.params.userId);
    res.json({ average_rating: avg });
  } catch (err) {
    console.error("Error fetching average rating:", err);
    res.status(500).json({ error: "Failed to fetch average rating" });
  }
});

router.get("/stats/:userId", async (req, res) => {
  try {
    const stats = await getRatingStats(req.params.userId);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching rating stats:", err);
    res.status(500).json({ error: "Failed to fetch rating stats" });
  }
});

// ✏️ Update
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateRating(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

// ❌ Delete
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteRating(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});

module.exports = router;