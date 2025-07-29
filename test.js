const filters = {type: 'yak', color: 'blue', cost: 'high'}
let sql = `SELECT * FROM yarn WHERE `;
const values = []
let index = 1;
    for (const filter in filters) {
       sql = `${sql}${filter} = $${index} AND ` 
       values.push(filters[filter])
       index++
    }
    sql = sql.slice(0, sql.length - 5) + ";"
    // sql = sql + ";";

console.log(sql, values);