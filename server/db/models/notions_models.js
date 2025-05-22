// NOTIONS MODEL

// id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
// pictures TEXT[],                          -- Array of image URLs
// name VARCHAR(100),                        -- Notion name
// quantity INTEGER,                         -- Number of items
// quality VARCHAR(20)  (quality IN ('new', 'good', 'fair', 'well-loved')), -- Condition 
// type VARCHAR(20)  (type IN ('sell', 'swap', 'donate')), -- Listing type 
// price DECIMAL(10, 2),                     -- Price with 2 decimal places
// location VARCHAR(100),                    -- Item location
// user_id INTEGER REFERENCES users(id),     -- Foreign key to users table
// description TEXT,                         -- Detailed description



const createNotion = async (data) => {
    try {
      const {
        pictures = [],
        name,
        quantity = null,
        quality = null,
        type = null,
        price = null,
        location = null,
        user_id,
        description = null,
      } = data;
  
      const { rows } = await query(
        `INSERT INTO notions (pictures, name, quantity, quality, type, price, location, user_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [pictures, name, quantity, quality, type, price, location, user_id, description]
      );
  
      return rows[0];
    } catch (error) {
      throw error;
    }
  };

  const getNotionById = async (id) => {
    try {
      const { rows } = await query("SELECT * FROM notions WHERE id = $1", [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  };


  const getNotionsByUser = async (userId) => {
    try {
      const { rows } = await query("SELECT * FROM notions WHERE user_id = $1", [
        userId,
      ]);
      return rows;
    } catch (error) {
      throw error;
    }
  };