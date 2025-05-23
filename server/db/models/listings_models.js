// listings_models.js
const client = require("../config/db");

// 🔧 CRUD Operations
async function createListing({ seller_id, listing_type, product_id }) {
  const result = await client.query(
    `INSERT INTO listings (seller_id, listing_type, product_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [seller_id, listing_type, product_id]
  );
  return result.rows[0];
}

async function getListingById(listingId) {
  const result = await client.query(`SELECT * FROM listings WHERE id = $1`, [
    listingId,
  ]);
  return result.rows[0];
}

async function getAllListings() {
  const result = await client.query(`SELECT * FROM listings`);
  return result.rows;
}

async function updateListing(listingId, { status }) {
  const result = await client.query(
    `UPDATE listings SET status = $1 WHERE id = $2 RETURNING *`,
    [status, listingId]
  );
  return result.rows[0];
}

async function deleteListing(listingId) {
  const result = await client.query(
    `DELETE FROM listings WHERE id = $1 RETURNING *`,
    [listingId]
  );
  return result.rows[0];
}

// 🔍 Query & Display
async function getListingsByUserId(userId) {
  const result = await client.query(
    `SELECT * FROM listings WHERE seller_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getListingsByType(type) {
  const result = await client.query(
    `SELECT * FROM listings WHERE listing_type = $1`,
    [type]
  );
  return result.rows;
}

async function getAvailableListings() {
  const result = await client.query(
    `SELECT * FROM listings WHERE status = 'available'`
  );
  return result.rows;
}

async function getArchivedListingsByUser(userId) {
  const result = await client.query(
    `SELECT * FROM listings WHERE seller_id = $1 AND status = 'archived'`,
    [userId]
  );
  return result.rows;
}

async function searchListings(query) {
  const result = await client.query(
    `SELECT * FROM listings WHERE
     CAST(product_id AS TEXT) ILIKE $1 OR
     CAST(seller_id AS TEXT) ILIKE $1 OR
     listing_type ILIKE $1`,
    [`%${query}%`]
  );
  return result.rows;
}

async function filterListings({ priceMin, priceMax, quality, location }) {
  const result = await client.query(
    `SELECT l.* FROM listings l
     JOIN users u ON l.seller_id = u.id
     JOIN yarn y ON l.product_id = y.id AND l.listing_type = 'yarn'
     WHERE y.price BETWEEN $1 AND $2
     AND y.quality = $3
     AND u.location ILIKE $4`,
    [priceMin, priceMax, quality, `%${location}%`]
  );
  return result.rows;
}

// 🏷️ Tag Functions
async function addTagsToListing(listingId, tagIds) {
  for (const tagId of tagIds) {
    await client.query(
      `INSERT INTO listing_tags (listing_id, tag_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [listingId, tagId]
    );
  }
}

async function removeTagFromListing(listingId, tagId) {
  await client.query(
    `DELETE FROM listing_tags WHERE listing_id = $1 AND tag_id = $2`,
    [listingId, tagId]
  );
}

async function clearTagsFromListing(listingId) {
  await client.query(`DELETE FROM listing_tags WHERE listing_id = $1`, [
    listingId,
  ]);
}

async function getTagsForListing(listingId) {
  const result = await client.query(
    `SELECT t.* FROM tags t
     JOIN listing_tags lt ON t.id = lt.tag_id
     WHERE lt.listing_id = $1`,
    [listingId]
  );
  return result.rows;
}

async function getListingsByTag(tagName) {
  const result = await client.query(
    `SELECT l.* FROM listings l
     JOIN listing_tags lt ON l.id = lt.listing_id
     JOIN tags t ON lt.tag_id = t.id
     WHERE t.name ILIKE $1`,
    [`%${tagName}%`]
  );
  return result.rows;
}

async function getAllTags() {
  const result = await client.query(`SELECT * FROM tags ORDER BY name ASC`);
  return result.rows;
}

// 🛒 Marketplace Logic
async function markListingAsSold(listingId) {
  return updateListing(listingId, { status: "sold" });
}

async function archiveListing(listingId) {
  return updateListing(listingId, { status: "archived" });
}

async function getListingStatus(listingId) {
  const result = await client.query(
    `SELECT status FROM listings WHERE id = $1`,
    [listingId]
  );
  return result.rows[0]?.status;
}

async function getListingsSoldByUser(userId) {
  const result = await client.query(
    `SELECT * FROM orders WHERE seller_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getListingsPurchasedByUser(userId) {
  const result = await client.query(
    `SELECT * FROM orders WHERE buyer_id = $1`,
    [userId]
  );
  return result.rows;
}

// 🔗 Related Data Functions
async function getListingWithProduct(listingId) {
  const listing = await getListingById(listingId);
  if (!listing) return null;

  const tableMap = {
    yarn: "yarn",
    notion: "notions",
    finished_object: "finished_objects",
  };
  const tableName = tableMap[listing.listing_type];

  if (!tableName) return listing;

  const result = await client.query(
    `SELECT * FROM ${tableName} WHERE id = $1`,
    [listing.product_id]
  );
  return { ...listing, product: result.rows[0] };
}

async function getListingWithFavorites(userId) {
  const result = await client.query(
    `SELECT l.*, f.id as favorite_id FROM listings l
     LEFT JOIN favorites f ON l.id = f.listing_id AND f.user_id = $1`,
    [userId]
  );
  return result.rows;
}

async function getListingWithMessages(listingId, userId) {
  const result = await client.query(
    `SELECT m.* FROM messages m
     JOIN msg_thread mt ON mt.id = m.conversation_id
     WHERE mt.listing_id = $1 AND (mt.buyer_id = $2 OR mt.seller_id = $2)`,
    [listingId, userId]
  );
  return result.rows;
}

async function getListingOwner(listingId) {
  const result = await client.query(
    `SELECT u.* FROM users u
     JOIN listings l ON l.seller_id = u.id
     WHERE l.id = $1`,
    [listingId]
  );
  return result.rows[0];
}

/** Listing Analytics Functions */

// Stats Function for Listing Type Count and Percentages:
async function getListingTypePercentages() {
  try {
    const { rows } = await client.query(
      `
      SELECT 
        listing_type,
        COUNT(*) AS type_count,
        (SELECT COUNT(*) FROM listings) AS total_count,
        ROUND(
           (COUNT(*) * 100.0) / NULLIF((SELECT COUNT(*) FROM listings), 0),
           2
        ) AS type_percent
      FROM listings
      GROUP BY listing_type
      ORDER BY type_percent DESC;
      `
    );

    return rows;
  } catch (error) {
    console.error("Error getting listing type percentages:", error);
    throw error;
  }
}

// Status Transition Counts (This would require a listing_audit table and automated audit 
// entries):

// Necessary Table:
// CREATE TABLE listings_audit (
//   audit_id SERIAL PRIMARY KEY,
//   listing_id INTEGER NOT NULL,
//   seller_id INTEGER,
//   action VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
//   changed_fields JSONB,
//   status_before VARCHAR(20),
//   status_after VARCHAR(20),
//   changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   changed_by INTEGER -- Optional: user id or admin id
// );

// Necessary Automation:
// CREATE OR REPLACE FUNCTION log_listing_change() RETURNS TRIGGER AS $$
// BEGIN
//   INSERT INTO listings_audit (
//     listing_id,
//     seller_id,
//     action,
//     changed_fields,
//     status_before,
//     status_after,
//     changed_by
//   )
//   VALUES (
//     NEW.id,
//     NEW.seller_id,
//     TG_OP,
//     hstore_to_jsonb_loose(hstore(OLD.*) - hstore(NEW.*)),
//     OLD.status,
//     NEW.status,
//     current_setting('myapp.current_user_id', true)::INTEGER
//   );
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// CREATE TRIGGER listings_audit_trigger
// AFTER INSERT OR UPDATE OR DELETE ON listings
// FOR EACH ROW EXECUTE FUNCTION log_listing_change();


// Final SQL for a Model: 
// SELECT 
//   status_before || ' → ' || status_after AS transition,
//   COUNT(*) AS count
// FROM listings_audit
// WHERE status_before IS NOT NULL AND status_after IS NOT NULL
// GROUP BY transition
// ORDER BY count DESC;


module.exports = {
  createListing,
  getListingById,
  getAllListings,
  updateListing,
  deleteListing,
  getListingsByUserId,
  getListingsByType,
  getAvailableListings,
  getArchivedListingsByUser,
  searchListings,
  filterListings,
  addTagsToListing,
  removeTagFromListing,
  clearTagsFromListing,
  getTagsForListing,
  getListingsByTag,
  getAllTags,
  markListingAsSold,
  archiveListing,
  getListingStatus,
  getListingsSoldByUser,
  getListingsPurchasedByUser,
  getListingWithProduct,
  getListingWithFavorites,
  getListingWithMessages,
  getListingOwner,
  getListingTypePercentages,
};
