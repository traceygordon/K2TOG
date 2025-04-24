
require("dotenv").config();
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL || 'postgres://postgres:2182@localhost:5432/k2tog_db')

module.exports = client;
