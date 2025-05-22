/**
 * Database Seeding Script
 * This script handles the creation and population of the database with initial data.
 * It includes functions for dropping tables, creating tables, and seeding initial data.
 */

// Import the database connection client from the config file
// This client manages multiple connections to the database efficiently
const client = require("./config/db");

/**
 * Drops all existing tables in the database
 * This ensures a clean slate before creating new tables
 * Tables are dropped in reverse order of dependencies to avoid foreign key constraint errors
 */
async function dropTables() {
  try {
    // Log the start of table dropping process
    console.log("Dropping existing tables...");

    // Execute SQL query to drop all tables
    // CASCADE ensures that dependent objects are also dropped
    // Tables are dropped in reverse order of dependencies
    await client.query(`
            DROP TABLE IF EXISTS messages CASCADE;        -- Drop messages table first as it depends on msg_thread
            DROP TABLE IF EXISTS msg_thread CASCADE;      -- Drop message threads
            DROP TABLE IF EXISTS listing_tags CASCADE;    -- Drop junction table for tags
            DROP TABLE IF EXISTS tags CASCADE;            -- Drop tags table
            DROP TABLE IF EXISTS favorites CASCADE;       -- Drop user favorites
            DROP TABLE IF EXISTS ratings CASCADE;         -- Drop user ratings
            DROP TABLE IF EXISTS orders CASCADE;          -- Drop order records
            DROP TABLE IF EXISTS finished_objects CASCADE;-- Drop finished objects
            DROP TABLE IF EXISTS notions CASCADE;         -- Drop notions
            DROP TABLE IF EXISTS yarn CASCADE;            -- Drop yarn products
            DROP TABLE IF EXISTS listings CASCADE;        -- Drop main listings
            DROP TABLE IF EXISTS users CASCADE;           -- Drop users last as other tables depend on it
        `);
    // Log successful completion of table dropping
    console.log("Tables dropped successfully");
  } catch (error) {
    // Log any errors that occur during table dropping
    console.error("Error dropping tables:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

/**
 * Creates all necessary tables for the application
 * Tables are created in order of dependencies to ensure foreign key constraints are satisfied
 * Includes creation of indexes for performance optimization
 */
async function createTables() {
  try {
    // Log the start of table creation process
    console.log("Creating tables...");

    // Execute SQL query to create all tables and indexes
    await client.query(`
        -- Enable UUID extension for generating unique identifiers
        -- This is useful for generating unique IDs across tables
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Users table: Stores user account information
        -- This is the base table that other tables reference
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            name VARCHAR(100) NOT NULL,               -- User's full name
            email VARCHAR(255) UNIQUE NOT NULL,       -- Unique email address
            password TEXT NOT NULL,                   -- Hashed password
            profile_pic TEXT,                         -- URL to profile picture
            location VARCHAR(100),                    -- User's location
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Yarn table: Stores yarn product information
        -- Contains specific attributes for yarn products
        CREATE TABLE yarn (
            id SERIAL PRIMARY KEY,                         -- Auto-incrementing primary key
            pictures TEXT[],                               -- Array of image URLs
            brand VARCHAR(100),                            -- Yarn brand name
            amount INTEGER,                                -- Number of skeins/balls
            length_yards INTEGER,                          -- Length in yards
            length_meters INTEGER,                         -- Length in meters
            weight VARCHAR(50)                             -- Yarn weight ('Thread', 'Cobweb', 'Lace', 'Light Fingering', 'Fingering', 'Sport', 'DK', 'Worsted', 'Aran', 'Bulky', 'Super Bulky', 'Jumbo')
            color VARCHAR(100)                             -- Yarn color('Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Gray', 'Black', 'White'),                     
            composition VARCHAR(50)                        -- Fiber content('Wool', 'Cashmere', 'Mohair', 'Angora', 'Acrylic', 'Alpaca', 'Cotton', 'Rayon', 'Chenille', 'Hemp', 'Linen', 'Merino', 'Metallic', 'Silk', 'Boucle', 'Bamboo', 'Elastane')
            quality VARCHAR(20)                            -- Condition (quality IN ('New', 'Good', 'Fair', 'Well-loved')),
            type VARCHAR(20)                               -- Listing type (type IN ('sell', 'swap', 'donate')), 
            price DECIMAL(10, 2),                          -- Price with 2 decimal places
            location VARCHAR(100),                         -- Item location
            needle_size VARCHAR(25)                        -- Knitting needle sizes ('1.50 mm/US 000', '1.75 mm/US 00', '2 mm/US 0', '2.25 mm/US 1', '2.75 mm/US 2', '3 mm', '3.125 mm/US 3', '3.25 mm/US 3', '3.50 mm/US 4', '3.75 mm/US 5', '4 mm/US 6', '4.25 mm/US 6', '4.50 mm/US 7', '5 mm/US 8', '5.25 mm/US 9', '5.50 mm/US 9', '5.75 mm/US 10', '6 mm/US 10', '6.50 mm/US 10 ½', '7 mm', '8 mm/US 11', '9 mm/US 13', '10 mm/US 15', '12.50 mm/US 17', '12.75 mm/US 17', '15 mm/US 19', '19 mm/US 35', '25 mm/US 50', '35 mm/US 70'), 
            hook_size VARCHAR(25)                          -- Crochet hook sizes ('2.25 mm/B-1', '2.50 mm', '2.75 mm/C-2', '3.125 mm/D', '3.25 mm/D-3', '3.50 mm/E-4', '3.75 mm/F-5', '4 mm/G-6', '4.25 mm/G', '4.50 mm/7', '5 mm/H-8', '5.25 mm/I', '5.50 mm/I-9', '5.75 mm/J', '6 mm/J-10', '6.50 mm/K-10 ½', '7 mm', '8 mm/L-11', '9 mm/M/N-13', '10 mm/N/P-15', '11.50 mm/P-16', '12 mm', '15 mm/P/Q', '15.75 mm/Q', '16 mm/Q', '19 mm/S', '25 mm/T/U/X', '30 mm/T/X'.),
            user_id INTEGER REFERENCES users(id),          -- Foreign key to users table
            description TEXT,                              -- Detailed description
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Notions table: Stores knitting/crochet notion information
        -- Contains specific attributes for notion products
        CREATE TABLE notions (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            pictures TEXT[],                          -- Array of image URLs
            name VARCHAR(100),                        -- Notion name
            quantity INTEGER,                         -- Number of items
            quality VARCHAR(20)  (quality IN ('new', 'good', 'fair', 'well-loved')), -- Condition 
            type VARCHAR(20)  (type IN ('sell', 'swap', 'donate')), -- Listing type 
            price DECIMAL(10, 2),                     -- Price with 2 decimal places
            location VARCHAR(100),                    -- Item location
            user_id INTEGER REFERENCES users(id),     -- Foreign key to users table
            description TEXT,                         -- Detailed description
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Finished objects table: Stores completed knitting/crochet projects
        -- Contains specific attributes for finished items
        CREATE TABLE finished_objects (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            pictures TEXT[],                          -- Array of image URLs
            name VARCHAR(100),                        -- Item name
            size VARCHAR(50),                         -- Size information
            quality VARCHAR(20)  (quality IN ('new', 'good', 'fair', 'well-loved')), -- Condition 
            type VARCHAR(20)  (type IN ('sell', 'swap', 'donate')), -- Listing type 
            price DECIMAL(10, 2),                     -- Price with 2 decimal places
            location VARCHAR(100),                    -- Item location
            user_id INTEGER REFERENCES users(id),     -- Foreign key to users table
            description TEXT,                         -- Detailed description
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Listings table: Main table for all product listings
        -- Links to specific product types through product_id
        CREATE TABLE listings (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            seller_id INTEGER REFERENCES users(id),   -- Foreign key to seller
            listing_type VARCHAR(20)  (listing_type IN ('yarn', 'notion', 'finished_object')), -- Product type
            product_id INTEGER NOT NULL,              -- ID of the specific product
            status VARCHAR(20) DEFAULT 'available',   -- Listing status
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Message thread table: Stores conversation threads between users
        -- Links buyers and sellers for specific listings
        CREATE TABLE msg_thread (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            buyer_id INTEGER REFERENCES users(id),    -- Foreign key to buyer
            seller_id INTEGER REFERENCES users(id),   -- Foreign key to seller
            listing_id INTEGER REFERENCES listings(id), -- Foreign key to listing
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Messages table: Stores individual messages within a thread
        -- Contains the actual message content
        CREATE TABLE messages (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            conversation_id INTEGER REFERENCES msg_thread(id) ON DELETE CASCADE, -- Thread reference
            sender_id INTEGER REFERENCES users(id),   -- Foreign key to sender
            text TEXT NOT NULL,                       -- Message content
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Orders table: Stores completed transactions
        -- Records successful sales/transactions
        CREATE TABLE orders (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            listing_id INTEGER REFERENCES listings(id), -- Foreign key to listing
            buyer_id INTEGER REFERENCES users(id),    -- Foreign key to buyer
            seller_id INTEGER REFERENCES users(id),   -- Foreign key to seller
            final_price DECIMAL(10, 2),               -- Final transaction price
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
            );

        -- Ratings table: Stores user ratings and reviews
        -- Allows users to rate each other after transactions
        CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            seller_id INTEGER REFERENCES users(id), -- Foreign key to seller
            buyer_id INTEGER REFERENCES users(id), -- Foreign key to user being reviewed
            role VARCHAR(10)  (role IN ('buyer', 'seller')), -- Role in transaction
            stars INTEGER  (stars BETWEEN 1 AND 5), -- Rating value
            review TEXT,                              -- Review text
            order_id INTEGER REFERENCES orders(id),   -- Foreign key to order
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation timestamp
            UNIQUE (seller_id, buyer_id, order_id) -- Prevent duplicate reviews
            );

        -- Favorites table: Stores user's favorite listings
        -- Many-to-many relationship between users and listings
        CREATE TABLE favorites (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to user
            listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE, -- Foreign key to listing
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation timestamp
            UNIQUE (user_id, listing_id)              -- Prevent duplicate favorites
            );

        -- Tags table: Stores available tags for listings
        -- Contains unique tag names
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            name VARCHAR(50) UNIQUE NOT NULL          -- Unique tag name
            );

        -- Listing tags table: Junction table for many-to-many relationship
        -- Links listings to their tags
        CREATE TABLE listing_tags (
            id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
            listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE, -- Foreign key to listing
            tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE, -- Foreign key to tag
            UNIQUE (listing_id, tag_id)               -- Prevent duplicate tag assignments
            );

        -- Create indexes for frequently queried columns to improve performance
        -- These indexes speed up common queries
        CREATE INDEX idx_listings_seller_id ON listings(seller_id);        -- Speed up seller queries
        CREATE INDEX idx_listings_product_id ON listings(product_id);      -- Speed up product queries
        CREATE INDEX idx_messages_conversation_id ON messages(conversation_id); -- Speed up message queries
        CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);              -- Speed up buyer order queries
        CREATE INDEX idx_orders_seller_id ON orders(seller_id);            -- Speed up seller order queries
        CREATE INDEX idx_ratings_buyer_id ON ratings(buyer_id);      -- Speed up rating queries
        CREATE INDEX idx_favorites_user_id ON favorites(user_id);          -- Speed up favorite queries
        CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);    -- Speed up listing favorite queries
        CREATE INDEX idx_listing_tags_listing_id ON listing_tags(listing_id); -- Speed up tag queries
        CREATE INDEX idx_listing_tags_tag_id ON listing_tags(tag_id);      -- Speed up listing queries by tag
        `);
    // Log successful completion of table creation
    console.log("Table created successfully.");
  } catch (error) {
    // Log any errors that occur during table creation
    console.error("Error creating tables:", error);
  }
}

/**
 * Creates initial users in the database
 * Seeds the database with sample user data for testing and development
 */
async function createInitialUsers() {
  try {
    console.log("Creating initial users...");
    const users = [
      {
        name: "Sarah Knits",
        email: "sarah@example.com",
        password: "$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0", // hashed "password123"
        profile_pic: "https://example.com/sarah.jpg",
        location: "New York, NY",
      },
      {
        name: "Mike Crochets",
        email: "mike@example.com",
        password: "$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0", // hashed "password123"
        profile_pic: "https://example.com/mike.jpg",
        location: "Los Angeles, CA",
      },
      {
        name: "Emma Yarns",
        email: "emma@example.com",
        password: "$2b$10$G/M.7zrA8Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0Zz0", // hashed "password123"
        profile_pic: "https://example.com/emma.jpg",
        location: "Chicago, IL",
      },
    ];

    // Insert each user into the database
    for (const user of users) {
      await client.query(
        `INSERT INTO users (name, email, password, profile_pic, location) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user.name, user.email, user.password, user.profile_pic, user.location]
      );
    }
    console.log("Initial users created successfully");
  } catch (error) {
    console.error("Error creating initial users:", error);
    throw error;
  }
}

/**
 * Creates initial listings in the database
 * Seeds the database with sample listings for yarn, notions, and finished objects
 * Randomly assigns listings to users
 */
async function createInitialListings() {
  try {
    console.log("Creating initial listings...");

    // Get all user IDs to randomly assign listings
    // This query retrieves all user IDs from the database
    const users = await client.query("SELECT id FROM users");
    // Convert the query results into an array of user IDs
    // users.rows is an array of objects, map() extracts just the id property
    const userIds = users.rows.map((user) => user.id);

    // Sample yarn listings data
    const yarnListings = [
      {
        brand: "Malabrigo",
        amount: 2,
        length_yards: 400,
        weight: "Worsted",
        color: "Purple",
        composition: "100% Merino Wool",
        quality: "new",
        type: "sell",
        price: 25.0,
        location: "New York, NY",
        description: "Beautiful hand-dyed merino wool yarn",
      },
      {
        brand: "Lion Brand",
        amount: 5,
        length_yards: 300,
        weight: "DK",
        color: "Blue",
        composition: "100% Acrylic",
        quality: "good",
        type: "swap",
        price: 15.0,
        location: "Los Angeles, CA",
        description: "Great for baby blankets",
      },
    ];

    // Sample notion listings data
    const notionListings = [
      {
        name: "Circular Needles",
        quantity: 1,
        quality: "new",
        type: "donate",
        price: 12.0,
        location: "Chicago, IL",
        description: "Size 8, 32 inch circular needles",
      },
      {
        name: "Stitch Markers",
        quantity: 10,
        quality: "good",
        type: "donate",
        price: 0.0,
        location: "New York, NY",
        description: "Assorted colors",
      },
    ];

    // Sample finished object listings data
    const finishedObjectListings = [
      {
        name: "Hand-knit Scarf",
        size: "Adult",
        quality: "new",
        type: "sell",
        price: 45.0,
        location: "Los Angeles, CA",
        description: "Warm wool scarf in herringbone pattern",
      },
      {
        name: "Crochet Blanket",
        size: "Baby",
        quality: "good",
        type: "swap",
        price: 30.0,
        location: "Chicago, IL",
        description: "Soft baby blanket in pastel colors",
      },
    ];

    // Insert yarn listings and create corresponding entries in the listings table
    for (const yarn of yarnListings) {
      const yarnResult = await client.query(
        `INSERT INTO yarn (pictures, brand, amount, length_yards, weight, color, 
                          composition, quality, type, price, location, user_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          ["https://example.com/yarn1.jpg"],
          yarn.brand,
          yarn.amount,
          yarn.length_yards,
          yarn.weight,
          yarn.color,
          yarn.composition,
          yarn.quality,
          yarn.type,
          yarn.price,
          yarn.location,
          // Math.random() generates a random number between 0 and 1
          // Multiply by userIds.length to get a number between 0 and (length-1)
          // Math.floor() rounds down to the nearest integer
          // This gives us a random index into the userIds array
          userIds[Math.floor(Math.random() * userIds.length)],
          yarn.description,
        ]
      );

      await client.query(
        `INSERT INTO listings (seller_id, listing_type, product_id, status)
         VALUES ($1, 'yarn', $2, 'available')`,
        // Again using Math.random() to select a random user as the seller
        // This ensures listings are distributed randomly among users
        [
          userIds[Math.floor(Math.random() * userIds.length)],
          yarnResult.rows[0].id,
        ]
      );
    }

    // Insert notion listings and create corresponding entries in the listings table
    for (const notion of notionListings) {
      const notionResult = await client.query(
        `INSERT INTO notions (pictures, name, quantity, quality, type, price, 
                            location, user_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          ["https://example.com/notion1.jpg"],
          notion.name,
          notion.quantity,
          notion.quality,
          notion.type,
          notion.price,
          notion.location,
          // Randomly select a user ID from the array
          // This distributes notion listings randomly among users
          userIds[Math.floor(Math.random() * userIds.length)],
          notion.description,
        ]
      );

      await client.query(
        `INSERT INTO listings (seller_id, listing_type, product_id, status)
         VALUES ($1, 'notion', $2, 'available')`,
        // Randomly assign a seller for this notion listing
        // This could be the same or different from the user_id above
        [
          userIds[Math.floor(Math.random() * userIds.length)],
          notionResult.rows[0].id,
        ]
      );
    }

    // Insert finished object listings and create corresponding entries in the listings table
    for (const finishedObject of finishedObjectListings) {
      const finishedObjectResult = await client.query(
        `INSERT INTO finished_objects (pictures, name, size, quality, type, price, 
                                     location, user_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          ["https://example.com/finished1.jpg"],
          finishedObject.name,
          finishedObject.size,
          finishedObject.quality,
          finishedObject.type,
          finishedObject.price,
          finishedObject.location,
          // Randomly select a user to own this finished object
          // This creates a realistic distribution of items among users
          userIds[Math.floor(Math.random() * userIds.length)],
          finishedObject.description,
        ]
      );

      await client.query(
        `INSERT INTO listings (seller_id, listing_type, product_id, status)
         VALUES ($1, 'finished_object', $2, 'available')`,
        // Randomly assign a seller for this finished object listing
        // Note: The seller could be different from the user_id above,
        // allowing for scenarios where users sell items on behalf of others
        [
          userIds[Math.floor(Math.random() * userIds.length)],
          finishedObjectResult.rows[0].id,
        ]
      );
    }

    console.log("Initial listings created successfully");
  } catch (error) {
    console.error("Error creating initial listings:", error);
    throw error;
  }
}

/**
 * Rebuilds the entire database
 * Drops existing tables, creates new tables, and seeds initial data
 */
async function rebuildDB() {
  try {
    console.log("🔸 Rebuilding database...");
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialListings();
    console.log("✅ Database rebuilt successfully.");
  } catch (error) {
    console.error("❌ Error rebuilding database:", error);
    throw error;
  }
}

/**
 * Starts the seeding process
 * Connects to the database, rebuilds it, and then closes the connection
 */
async function start() {
  try {
    console.log("🚀 Starting database seeding...");
    await client.connect();
    await rebuildDB();
  } catch (error) {
    console.error("❌ Error during seed startup:", error);
    throw error;
  } finally {
    await client.end();
    console.log("🔚 Seeding process complete.");
  }
}

// Execute the seeding process
start();
