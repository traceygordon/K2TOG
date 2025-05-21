//yarn models

const client = require("../config/db");

// [o]brand
// [o]amount
// [o]length_yards
// [o]length_meters
// [o]weight
// [o]color 
// [o]composition
// [o]quality CHECK (quality IN ('new', 'good', 'fair', 'well-loved'))
// [o]type CHECK (type IN ('sell', 'swap', 'donate'))
// [o]price
// [o]location use openstreetmap geonames web service to search radius of user location
// [o]needle_size
// [o]hook_size 
// [] user/buyer pays shipping ADD

async function createYarn(data) {
  const result = await client.query(
    `INSERT INTO yarn (data)
     VALUES ($1)
     RETURNING *`,
    [data]
  );
  return result.rows[0];
}

async function updateYarn(updateData, id){

    const result = await client.query(
        `UPDATE yarn
         SET updateData = $1
         WHERE id = $2
         RETURNING *`,
    
    [updateData, id]
    );
  return result.rows[0];
}

async function getYarnById(YarnId){
    const result = await client.query(
        `SELECT * FROM yarn WHERE id = $1`,
        [YarnId]
      );
      return result.rows;
}

//ADD useMemo
async function getYarnByFilters(filters) {
    let query = `SELECT * FROM yarn WHERE 1=1`;
    const values = [];
    let index = 1;

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        query += ` AND price BETWEEN $${index} AND $${index + 1}`;
        values.push(filters.minPrice, filters.maxPrice);
        index += 2;
    }

    if (filters.brands?.length) {
        query += ` AND brand = ANY($${index})`;
        values.push(filters.brands);
        index++;
    }

    if (filters.colors?.length) {
        query += ` AND color = ANY($${index})`;
        values.push(filters.colors);
        index++;
    }

    if (filters.qualities?.length) {
        query += ` AND quality = ANY($${index})`;
        values.push(filters.qualities);
        index++;
    }

    if (filters.compositions?.length) {
        query += ` AND composition = ANY($${index})`;
        values.push(filters.compositions);
        index++;
    }

    if (filters.types?.length) {
        query += ` AND type = ANY($${index})`;
        values.push(filters.types);
        index++;
    }

    if (filters.locations?.length) {
        query += ` AND location = ANY($${index})`;
        values.push(filters.locations);
        index++;
    }

    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        query += ` AND amount BETWEEN $${index} AND $${index + 1}`;
        values.push(filters.minAmount, filters.maxAmount);
        index += 2;
    }

    if (filters.minLength !== undefined && filters.maxLength !== undefined && filters.unit) {
        query += ` AND length BETWEEN $${index} AND $${index + 1} AND unit = $${index + 2}`;
        values.push(filters.minLength, filters.maxLength, filters.unit);
        index += 3;
    }

    if (filters.weight !== undefined) {
        query += ` AND weight = $${index}`;
        values.push(filters.weight);
        index++;
    }

    if (filters.needle_sizes?.length) {
        query += ` AND needle_size = ANY($${index})`;
        values.push(filters.needle_sizes);
        index++;
    }

    if (filters.hook_sizes?.length) {
        query += ` AND hook_size = ANY($${index})`;
        values.push(filters.hook_sizes);
        index++;
    }

    const result = await client.query(query, values);
    return result.rows;
}


// Export all functions
module.exports = {
  createYarn,
  updateYarn,
  getYarnById,
getYarnByFilters
};
