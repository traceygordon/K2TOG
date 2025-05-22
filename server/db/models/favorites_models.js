// favorites_models.js
const client = require('../config/db');

// 📥 Create
async function addFavorite(userId, listingId) {
  const result = await client.query(
    `INSERT INTO favorites (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING
     RETURNING *`,
    [userId, listingId]
  );
  return result.rows[0];
}

// 📤 Read / Retrieve
async function getFavoritesByUserId(userId) {
  const result = await client.query(
    `SELECT 
      l.*,
      CASE 
        WHEN l.listing_type = 'yarn' THEN 
          (SELECT row_to_json(y) FROM yarn y WHERE y.id = l.product_id)
        WHEN l.listing_type = 'notion' THEN 
          (SELECT row_to_json(n) FROM notions n WHERE n.id = l.product_id)
        WHEN l.listing_type = 'finished_object' THEN 
          (SELECT row_to_json(f) FROM finished_objects f WHERE f.id = l.product_id)
      END as product_details,
      u.name as seller_name,
      u.profile_pic as seller_profile_pic
     FROM listings l
     JOIN favorites f ON l.id = f.listing_id
     JOIN users u ON l.seller_id = u.id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function isListingFavoritedByUser(userId, listingId) {
  const result = await client.query(
    `SELECT * FROM favorites WHERE user_id = $1 AND listing_id = $2`,
    [userId, listingId]
  );
  return result.rows.length > 0;
}

// ❌ Delete
async function removeFavorite(userId, listingId) {
  const result = await client.query(
    `DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING *`,
    [userId, listingId]
  );
  return result.rows[0];
}

async function clearFavoritesByUser(userId) {
  const result = await client.query(
    `DELETE FROM favorites WHERE user_id = $1 RETURNING *`,
    [userId]
  );
  return result.rows;
}

// 📊 (Optional Extras)
async function countFavoritesForListing(listingId) {
  const result = await client.query(
    `SELECT COUNT(*)::int FROM favorites WHERE listing_id = $1`,
    [listingId]
  );
  return result.rows[0].count;
}

async function getUsersWhoFavoritedListing(listingId) {
  const result = await client.query(
    `SELECT u.* FROM users u
     JOIN favorites f ON u.id = f.user_id
     WHERE f.listing_id = $1`,
    [listingId]
  );
  return result.rows;
}

module.exports = {
  addFavorite,
  getFavoritesByUserId,
  isListingFavoritedByUser,
  removeFavorite,
  clearFavoritesByUser,
  countFavoritesForListing,
  getUsersWhoFavoritedListing
};
