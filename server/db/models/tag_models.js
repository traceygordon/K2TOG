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
// Inserting tags into the junction table
async function createPieceTag(listing_id, tag_id) {
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

//Adding tags to a piece
async function addTagsToPiece(listing_id, tagList) {
  try {
    const createPieceTagPromises = tagList.map((tag) =>
      createPieceTag(listing_id, tag.id)
    );

    await Promise.all(createPieceTagPromises);

    return await getPieceById(listing_id);
  } catch (error) {
    throw error;
  }
}

// Fetch All Tags (testDB function):
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

// Fetch Pieces by TagName (testDB function):
async function getPiecesByTagName(tagName) {
  try {
    const pieceIds = await client.query(
      `
            SELECT *
            FROM listing_tags
            WHERE "tag_id"=(SELECT tags.id FROM tags WHERE tags.name=$1);
          `,
      [tagName]
    );

    return listing_id.rows;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createTags,
  createPieceTag,
  getPiecesByTagName,
  getAllTags,
  addTagsToPiece,
};
