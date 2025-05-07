// Import the database connection client from the config file
// This client manages multiple connections to the database efficiently
const client = require("../config/db");

// Function imports:
const { getListingById } = require("../db/models/listings_models");

/**
 * Tag Methods
 */
//Creating tags:
async function createTags(tagList) {
  // Ensure tagList is an array
  if (!Array.isArray(tagList)) {
    tagList = [tagList];
  }

  if (tagList.length === 0) {
    return;
  }

  const valuesStringInsert = tagList
    .map((_, index) => `$${index + 1}`)
    .join("), (");
  const valuesStringSelect = tagList
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  try {
    // Insert all tags, ignoring duplicates
    await client.query(
      `
            INSERT INTO tags(name)
            VALUES (${valuesStringInsert})
            ON CONFLICT (name) DO NOTHING;
          `,
      tagList
    );
    // Grab all tags and return
    const { rows } = await client.query(
      `
            SELECT * FROM tags
            WHERE name IN (${valuesStringSelect});
          `,
      tagList
    );
    return rows;
  } catch (error) {
    throw error;
  }
}
// Inserting tags into the junction table:
async function createListingTag(listing_id, tag_id) {
  try {
    await client.query(
      `
            INSERT INTO listing_tags("listing_id", "tag_id")
            VALUES ($1, $2)
            ON CONFLICT ("listing_id", "tag_id") DO NOTHING;
          `,
      [listing_id, tag_id]
    );
  } catch (error) {
    throw error;
  }
}

//Adding tags to a listing:
async function addTagsToListing(listing_id, tagList) {
  try {
    const createListingTagPromises = tagList.map((tag) =>
      createListingTag(listing_id, tag.id)
    );

    await Promise.all(createListingTagPromises);

    return await getListingById(listing_id);
  } catch (error) {
    throw error;
  }
}

// Fetch All Tags:
async function getAllTags() {
  try {
    const { rows } = await client.query(`
            SELECT * 
            FROM tags;
          `);

    return { rows };
  } catch (error) {
    throw error;
  }
}

// Fetch Listings by TagName:
async function getListingsByTagName(tagName) {
  try {
    const listingIds = await client.query(
      `
            SELECT *
            FROM listing_tags
            WHERE "tag_id"=(SELECT tags.id FROM tags WHERE tags.name=$1);
          `,
      [tagName]
    );

    return listingIds.rows;
  } catch (error) {
    throw error;
  }
}

// Fetch Listings by TagId:
async function getListingsByTagId(tagId) {
  try {
    const { rows } = await client.query(
      `
        SELECT listings.*
        FROM listing_tags
        JOIN listings ON listing_tags.listing_id = listings.id
        WHERE listing_tags.tag_id = $1
          `,
      [tagId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

// Fetch Tag by Id:
async function getTagById(id) {
  const result = await client.query(`SELECT * FROM tags WHERE id = $1`, [id]);
  return result.rows[0];
}

// Fetch Tag by Name:
async function getTagByName(name) {
  const result = await client.query(`SELECT * FROM tags WHERE name = $1`, [
    name,
  ]);
  return result.rows[0];
}

// Remove Tag from a Listing:
async function removeTagFromListing({ listing_id, tag_id }) {
  try {
    const { rows } = await client.query(
      `
    DELETE FROM listing_tags  
    WHERE listing_id=$1 AND tag_id=$2
    RETURNING *;
  `,
      [listing_id, tag_id]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Clear all Tags from a Listing:
async function removeAllTagsFromListing({ listing_id }) {
  try {
    const { rows } = await client.query(
      `
    DELETE FROM listing_tags 
    WHERE listing_id=$1
    RETURNING *;
  `,
      [listing_id]
    );
    return rows.length > 0 ? rows : null;
  } catch (error) {
    throw error;
  }
}

// Fetch all Tags for a Listing:
async function getTagsforListing(listingId) {
  try {
    const { rows } = await client.query(
      `
            SELECT *
            FROM listing_tags
            WHERE "listing_id"=($1);
          `,
      [listingId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

// Fetch Listing Ids by Tag Ids:
async function getListingIdsByTagId(tagId) {
  try {
    const { rows } = await client.query(
      `
        SELECT listing_id
        FROM listing_tags
        WHERE tag_id = $1
      `,
      [tagId]
    );
    return rows.map((row) => row.listing_id);
  } catch (error) {
    throw error;
  }
}

// Completely Delete a Tag (2 steps):
async function deleteTagCompletely({ tag_id }) {
  try {
    // Step 1: Remove tag from all listings (avoids any possible foreign key violation error)
    await client.query(
      `
      DELETE FROM listing_tags
      WHERE tag_id = $1;
      `,
      [tag_id]
    );

    // Step 2: Delete tag from tags table
    const { rows } = await client.query(
      `
      DELETE FROM tags
      WHERE id = $1
      RETURNING *;
      `,
      [tag_id]
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Upadate/Rename a Tag:
/** Params: # =tagID + "string" = newName */
/** Returns: object(updated record as Promise) */
// Helper Function to see if a tag exists:
async function tagNameExists(name) {
  try {
    const result = await client.query(
      `
        SELECT 1 FROM tags
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1;
        `,
      [name]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if tag name exists:", error);
    throw error;
  }
}
// Tag name update function:
async function renameTag(tagId, newName) {
  try {
    const exists = await tagNameExists(newName);
    if (exists) {
      throw new Error(`A tag with the name "${newName}" already exists.`);
    }

    const result = await client.query(
      `
        UPDATE tags
        SET name = $1
        WHERE id = $2
        RETURNING *;
        `,
      [newName, tagId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Tag with ID ${tagId} not found.`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error renaming tag:", error);
    throw error;
  }
}
//Usage Example:
//  renameTag(3, "new-tag-name")
//  .then(updatedTag => console.log("Updated Tag:", updatedTag))
//  .catch(err => console.error("Rename failed:", err));



/** Tag Analytics Functions */

// Auditing Function for Checking the # of Listings with a Tag:
/** Params: # =tagID + boolean = includeListings */
/** Returns: object( audit results as Promise) */
async function auditTagUsage(tagId, includeListings = false) {
  try {
    const tagResult = await client.query(
      `SELECT name FROM tags WHERE id = $1`,
      [tagId]
    );

    if (tagResult.rows.length === 0) {
      throw new Error(`Tag with ID ${tagId} not found.`);
    }

    const tagName = tagRes.rows[0].name;

    const countResult = await client.query(
      `
      SELECT COUNT(*) AS listing_count
      FROM listing_tags
      WHERE tag_id = $1
      `,
      [tagId]
    );

    const listingCount = parseInt(countResult.rows[0].listing_count, 10);

    let listings = [];
    if (includeListings) {
      const listResult = await client.query(
        `
        SELECT listings.*
        FROM listing_tags
        JOIN listings ON listing_tags.listing_id = listings.id
        WHERE listing_tags.tag_id = $1
        `,
        [tagId]
      );
      listings = listResult.rows;
    }

    return {
      tagId,
      tagName,
      listingCount,
      listings,
    };
  } catch (error) {
    console.error("Error auditing tag usage:", error);
    throw error;
  }
}
//Usage Example:
// auditTagUsage(3, true)
// .then(data => console.log("Tag Audit:", data))
// .catch(err => console.error("Audit failed:", err));


// Stats Function for Finding the Most Utilized Tag (Max Set to 10):
/** Params: # =limist (number of top tags to return) */
async function getTopTags(limit = 10) {
  try {
    const { rows } = await client.query(
      `
      SELECT 
        tags.id,
        tags.name,
        COUNT(listing_tags.listing_id) AS usage_count
      FROM tags
      LEFT JOIN listing_tags ON tags.id = listing_tags.tag_id
      GROUP BY tags.id, tags.name
      ORDER BY usage_count DESC
      LIMIT $1;
      `,
      [limit]
    );

    return rows;
  } catch (error) {
    console.error("Error getting top tags:", error);
    throw error;
  }
}

// Stats Function for Tag Usage Percentages:
async function getTagUsagePercentages() {
  try {
    const { rows } = await client.query(
      `
      SELECT 
        tags.id,
        tags.name,
        COUNT(lt.listing_id) AS usage_count,
        ROUND(
          (COUNT(lt.listing_id) * 100.0) / NULLIF((SELECT COUNT(*) FROM listings), 0),
          2
        ) AS usage_percent
      FROM tags
      LEFT JOIN listing_tags lt ON tags.id = lt.tag_id
      GROUP BY tags.id, tags.name
      ORDER BY usage_percent DESC;
      `
    );

    return rows;
  } catch (error) {
    console.error("Error getting tag usage percentages:", error);
    throw error;
  }
}


module.exports = {
  createTags,
  createListingTag,
  getListingsByTagName,
  getListingsByTagId,
  getAllTags,
  getTagById,
  getTagByName,
  getListingIdsByTagId,
  getTagsforListing,
  addTagsToListing,
  removeTagFromListing,
  removeAllTagsFromListing,
  renameTag,
  deleteTagCompletely,
  auditTagUsage,
  getTopTags,
  getTagUsagePercentages,
};
