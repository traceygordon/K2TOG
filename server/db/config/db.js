const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});  

module.exports = pool;

// .env file:
// Create own .env file and add the following:

// DB_USER=postgres
// DB_PASSWORD=postgres
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=acme_marketplace_db
// PORT=5000
// JWT_SECRET=shhh

