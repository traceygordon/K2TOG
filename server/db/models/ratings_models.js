//RATINGS MODELS

// 📤 Read
// [o]getRatingById(ratingId)
// [o]getRatingsForOrder(orderId)
// [o]getRatingsBySeller(seller_id)
// [o]getRatingsByBuyer
// [o]Check if a rating already exists between two users for a specific order
// [o]getAverageRatingForUser(userId)
// [o]Get a user's average rating score (1–5 stars)

// ✏️ Update
// [o]updateRating(ratingId, updateData)

// ❌ Delete
// [o]deleteRating(ratingId)

// id
// seller_id
// buyer_id
// role ('buyer', 'seller'))
// stars (stars BETWEEN 1 AND 5)
// review (text)
// order_id

const client = require("../config/db");

//CREATE
const createRating = async (seller_id, buyer_id, order_id, stars, review) => {
  try {
    if (stars < 1 || stars > 5) {
      throw new Error("Rating must be between 1 and 5 stars.");
    }

    const { rows } = await query(
      `INSERT INTO ratings (seller_id, buyer_id, order_id, stars, review) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [seller_id, buyer_id, order_id, stars, review]
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
};

//READ
const getRatingById = async (ratingId) => {
  try {
    const { rows } = await query("SELECT * FROM ratings WHERE id = $1", [
      ratingId,
    ]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const getRatingsForOrder = async (orderId) => {
  try {
    const { rows } = await query("SELECT * FROM ratings WHERE order_id = $1", [
      orderId,
    ]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const getRatingsBySeller = async (seller_id) => {
  try {
    const { rows } = await query("SELECT * FROM ratings WHERE seller_id = $1", [
      seller_id,
    ]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const getRatingsByBuyer = async (buyer_id) => {
  try {
    const { rows } = await query("SELECT * FROM ratings WHERE buyer_id = $1", [
      buyer_id,
    ]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const checkIfRatingExists = async (buyer_id, seller_id, order_id) => {
  try {
    const { rows } = await query(
      "SELECT * FROM ratings WHERE buyer_id = $1 AND seller_id = $2 AND order_id = $3",
      [buyer_id, seller_id, order_id]
    );
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

const getAverageRatingForUser = async (userId) => {
  try {
    const { rows } = await query(
      "SELECT AVG(stars) AS average_rating FROM ratings WHERE seller_id = $1 OR buyer_id = $1",
      [userId]
    );
    return rows[0].average_rating;
  } catch (error) {
    throw error;
  }
};

const getRatingStats = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT COUNT(*) AS total_ratings, AVG(stars) AS avg_rating 
       FROM ratings WHERE seller_id = $1 OR buyer_id = $1`,
      [userId]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

//UPDATE
const updateRating = async (ratingId, updateData) => {
  if (Object.keys(updateData).length === 0) return;

  const setString = Object.keys(updateData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  try {
    const { rows } = await query(
      `UPDATE ratings SET ${setString} WHERE id = $${Object.keys(updateData).length + 1} RETURNING *`,
      [...Object.values(updateData), ratingId]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

//DELETE
const deleteRating = async (ratingId) => {
  try {
    const { rows } = await query("DELETE FROM ratings WHERE id = $1 RETURNING *", [ratingId]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};