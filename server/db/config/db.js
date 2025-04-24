
require("dotenv").config();
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/k2tog_yarn-marketplace_db')

module.exports = client;
