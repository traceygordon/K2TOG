// user_models.js
const client = require('../config/db');

// 🔐 Authentication
async function createUser({ name, email, password, profile_pic, location }) {
  const result = await client.query(
    `INSERT INTO users (name, email, password, profile_pic, location)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, password, profile_pic, location]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await client.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

async function getUserById(id) {
  const result = await client.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

// 📋 User Profile
async function updateUserProfile(userId, { name, profile_pic, location }) {
  const result = await client.query(
    `UPDATE users
     SET name = $1, profile_pic = $2, location = $3
     WHERE id = $4
     RETURNING *`,
    [name, profile_pic, location, userId]
  );
  return result.rows[0];
}

async function deleteUser(userId) {
  const result = await client.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await client.query(`SELECT * FROM users`);
  return result.rows;
}

async function getUserPublicProfile(userId) {
  const result = await client.query(
    `SELECT id, name, profile_pic, location FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
}

// ⭐ Ratings & Reviews
async function getUserRatings(userId) {
  const result = await client.query(
    `SELECT * FROM ratings WHERE reviewee_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getAverageUserRating(userId) {
  const result = await client.query(
    `SELECT AVG(stars)::numeric(2,1) as average FROM ratings WHERE reviewee_id = $1`,
    [userId]
  );
  return result.rows[0].average;
}

async function createUserRating({ reviewer_id, reviewee_id, role, stars, review, order_id }) {
  const result = await client.query(
    `INSERT INTO ratings (reviewer_id, reviewee_id, role, stars, review, order_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [reviewer_id, reviewee_id, role, stars, review, order_id]
  );
  return result.rows[0];
}

// 🛒 Activity
async function getUserFavorites(userId) {
  const result = await client.query(
    `SELECT listings.* FROM listings
     JOIN favorites ON listings.id = favorites.listing_id
     WHERE favorites.user_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getUserListings(userId) {
  const result = await client.query(
    `SELECT * FROM listings WHERE seller_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getUserOrders(userId) {
  const result = await client.query(
    `SELECT * FROM orders WHERE buyer_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getUserSales(userId) {
  const result = await client.query(
    `SELECT * FROM orders WHERE seller_id = $1`,
    [userId]
  );
  return result.rows;
}

// Export all functions
module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getUserPublicProfile,
  getUserRatings,
  getAverageUserRating,
  createUserRating,
  getUserFavorites,
  getUserListings,
  getUserOrders,
  getUserSales,
};
