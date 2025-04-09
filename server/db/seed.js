//Drop existing tables
async function dropTables() {
  try {
    console.log("Dropping existing tables...");
    await client.query(`
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS msg_thread CASCADE;
            DROP TABLE IF EXISTS listing_tags CASCADE;
            DROP TABLE IF EXISTS tags CASCADE;
            DROP TABLE IF EXISTS favorites CASCADE;
            DROP TABLE IF EXISTS ratings CASCADE;
            DROP TABLE IF EXISTS orders CASCADE;
            DROP TABLE IF EXISTS finished_objects CASCADE;
            DROP TABLE IF EXISTS notions CASCADE;
            DROP TABLE IF EXISTS yarn CASCADE;
            DROP TABLE IF EXISTS listings CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
    console.log("Tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  }
}

//Create new tables
async function createTables() {
  try {
    console.log("Creating tables...");
    await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            profile_pic TEXT,
            location VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE listings (
            id SERIAL PRIMARY KEY,
            seller_id INTEGER REFERENCES users(id),
            listing_type VARCHAR(20) CHECK (listing_type IN ('yarn', 'notion', 'finished_object')),
            product_id INTEGER, -- will reference yarn/notions/finished_objects based on type
            status VARCHAR(20) DEFAULT 'available', -- available, sold, archived
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );


            CREATE TABLE yarn (
            id SERIAL PRIMARY KEY,
            pictures TEXT[], -- array of image URLs
            brand VARCHAR(100),
            amount INTEGER, -- number of skeins, hanks, or balls
            length_yards INTEGER,
            length_meters INTEGER,
            weight VARCHAR(50), -- fingering, sport, DK, etc
            color VARCHAR(100),
            composition TEXT, -- wool, alpaca, etc
            quality VARCHAR(20) CHECK (quality IN ('new', 'good', 'fair', 'well-loved')),
            type VARCHAR(20) CHECK (type IN ('sell', 'swap', 'donate')),
            price DECIMAL(10, 2),
            location VARCHAR(100),
            user_id INTEGER REFERENCES users(id),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE notions (
            id SERIAL PRIMARY KEY,
            pictures TEXT[],
            name VARCHAR(100),
            quantity INTEGER,
            quality VARCHAR(20) CHECK (quality IN ('new', 'good', 'fair', 'well-loved')),
            type VARCHAR(20) CHECK (type IN ('sell', 'swap', 'donate')),
            price DECIMAL(10, 2),
            location VARCHAR(100),
            user_id INTEGER REFERENCES users(id),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE finished_objects (
            id SERIAL PRIMARY KEY,
            pictures TEXT[],
            name VARCHAR(100),
            size VARCHAR(50),
            quality VARCHAR(20) CHECK (quality IN ('new', 'good', 'fair', 'well-loved')),
            type VARCHAR(20) CHECK (type IN ('sell', 'swap', 'donate')),
            price DECIMAL(10, 2),
            location VARCHAR(100),
            user_id INTEGER REFERENCES users(id),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE msg_thread (
            id SERIAL PRIMARY KEY,
            buyer_id INTEGER REFERENCES users(id),
            seller_id INTEGER REFERENCES users(id),
            listing_id INTEGER REFERENCES listings(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER REFERENCES msg_thread(id) ON DELETE CASCADE,
            sender_id INTEGER REFERENCES users(id),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            listing_id INTEGER REFERENCES listings(id),
            buyer_id INTEGER REFERENCES users(id),
            seller_id INTEGER REFERENCES users(id),
            final_price DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,
            reviewer_id INTEGER REFERENCES users(id),
            reviewee_id INTEGER REFERENCES users(id),
            role VARCHAR(10) CHECK (role IN ('buyer', 'seller')), -- who is being rated
            stars INTEGER CHECK (stars BETWEEN 1 AND 5),
            review TEXT,
            order_id INTEGER REFERENCES orders(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (reviewer_id, reviewee_id, order_id) -- prevent duplicates
            );


            CREATE TABLE favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, listing_id) -- prevent duplicates
            );

            CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
            );

            CREATE TABLE listing_tags (
            id SERIAL PRIMARY KEY,
            listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
            tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
            UNIQUE (listing_id, tag_id) -- prevent duplicate tagging
            );
        `);
    console.log("Table created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}
