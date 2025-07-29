//yarn models
// const prisma = require("../../prisma/index");
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
  const {rows: [result]} = await client.query(
    `INSERT INTO yarn (data)
     VALUES ($1)
     RETURNING *`,
    [data]
  );
  return result;
}

async function updateYarn(updateData, id) {
  const {rows: [result]} = await client.query(
    `UPDATE yarn
         SET updateData = $1
         WHERE id = $2
         RETURNING *`,

    [updateData, id]
  );
  return result;
}

async function getYarnById(YarnId) {
  const result = await client.query(`SELECT * FROM yarn WHERE id = $1`, [
    YarnId,
  ]);
  return result.rows;
}

//ADD useMemo
async function getYarnByFilters(filters) {
  try {
    let sql = `SELECT * FROM yarn WHERE `;
    const values = [];
    let index = 1;
    for (const filter in filters) {
      sql = `${sql}${filter} = $${index} AND `;
      values.push(filters[filter]);
      index++;
    }
    sql = sql.slice(0, sql.length - 5) + ";" //remove the trailing "AND " (5 spaces)
    //this is destructuring the rows object and renaming it to yarn
    const {rows: yarn} = await client.query(sql, values)
    return yarn
    // const yarnResults = await prisma.yarn.findMany({
    //   where: filters,
    // });
    // return yarnResults;
  } catch (err) {
    console.log(err);
    return err;
  }
}

// Export all functions
module.exports = {
  createYarn,
  updateYarn,
  getYarnById,
  getYarnByFilters,
};
