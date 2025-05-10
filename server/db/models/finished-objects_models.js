// Import the database connection client from the config file
// This client manages multiple connections to the database efficiently
const client = require("../config/db");

// Necessary Fields:
//    id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
// pictures TEXT[],                          -- Array of image URLs
// name VARCHAR(100),                        -- Item name
// size VARCHAR(50),                         -- Size information
// quality VARCHAR(20)  (quality IN ('new', 'good', 'fair', 'well-loved')), -- Condition
// type VARCHAR(20)  (type IN ('sell', 'swap', 'donate')), -- Listing type
// price DECIMAL(10, 2),                     -- Price with 2 decimal places
// location VARCHAR(100),                    -- Item location
// user_id INTEGER REFERENCES users(id),     -- Foreign key to users table
// description TEXT,                         -- Detailed description
// created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp


// Creating Finished Object:
async function createFinishedObject({
  pictures = [],
  name,
  size,
  quality,
  type,
  price = null,
  location,
  user_id,
  description = "",
}) {
  const result = await client.query(
    `INSERT INTO finished_objects (
            pictures, name, size, quality, type,
            price, location, user_id, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
    [pictures, name, size, quality, type, price, location, user_id, description]
  );

  return result.rows[0];
}

// Fetching Finished Objects by Id: 
async function getFinishedObjectById(objectId) {
  const result = await client.query(
    `SELECT * FROM finished_objects WHERE id = $1`,
    [objectId]
  );
  return result.rows[0];
}

// Fetching All Finished Objects: 
async function getAllFinishedObjects() {
  const result = await client.query(`SELECT * FROM finished_objects`);
  return result.rows;
}

// Fetching Objects by Size:
async function getFinishedObjectBySize(size) {
  const result = await client.query(
    `SELECT * FROM finished_objects WHERE size = $1`,
    [size]
  );
  return result.rows;
}

module.exports = {
  createFinishedObject,
  getFinishedObjectById,
  getAllFinishedObjects,
  getFinishedObjectBySize,
};
