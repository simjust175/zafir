import db from "../config/db.js";

const isNotDeleted = "deleted_at IS NULL";

const allowedTables = ["emails", "invoices", "projects", "users"];

function isTableAllowed(database) {
  return allowedTables.includes(database);
}

class General {
  static async get(database) {
    if (!isTableAllowed(database)) throw new Error("Invalid table name");

    const query = `SELECT * FROM \`${database}\` WHERE ${isNotDeleted}`;
    const [rows] = await db.query(query);
    return rows;
  }

  static async getWithFilter(database, columns = "*", whereClause = "", values = []) {
    if (!isTableAllowed(database)) throw new Error("Invalid table name");

    const selectedColumns = Array.isArray(columns) ? columns.map(col => `\`${col}\``).join(", ") : columns;

    let query = `SELECT ${selectedColumns} FROM \`${database}\` WHERE ${isNotDeleted}`;
    if (whereClause) query += ` AND ${whereClause}`;
    
    const [rows] = await db.query(query, values);
    return rows;
  }

  static async getMultipleFilteredGroups(database, columns = "*", filterField = "id", filterValues = []) {
    console.log("val val val", filterValues, !Array.isArray(filterValues));
    
    if (!isTableAllowed(database)) throw new Error("Invalid table name");
    if (!Array.isArray(filterValues) || filterValues.length === 0) return [];
  
    const selectedColumns = Array.isArray(columns)
      ? columns.map(col => `\`${col}\``).join(", ")
      : columns;
  
    const placeholders = filterValues.map(() => "?").join(", ");
    const whereClause = `\`${filterField}\` IN (${placeholders})`;
  
    const query = `SELECT ${selectedColumns} FROM \`${database}\` WHERE ${isNotDeleted} AND ${whereClause}`;
    const [rows] = await db.query(query, filterValues);
    
    
    // Optional: group by filterField
    const grouped = {};
    for (const row of rows) {
      const key = row[filterField];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
  
    return grouped;
  }

  static async post(table, body) {
    if (!isTableAllowed(table)) throw new Error("Invalid table name");
  
    const INSERT_SQL = `INSERT INTO \`${table}\` SET ?`;
    const [insertResult] = await db.query(INSERT_SQL, [body]);
  
    if (!insertResult.insertId) throw new Error("Insert failed");
  
    // Fetch and return the inserted row using insertId
    const SELECT_SQL = `SELECT * FROM \`${table}\` WHERE ${table.slice(0, -1)}_id = ?`;
    const [rows] = await db.query(SELECT_SQL, [insertResult.insertId]);
  
    return rows[0];
  }

  static async patch(table, body, whereClause, id) {    
    if (!allowedTables.includes(table)) {
      throw new Error("Invalid table name");
    }

    // Optional: Define updatable fields per table
    const fieldList = {
      invoices: ['issuer', 'amount', 'includesBtw', 'btwPercent', 'margin', 'deleted_at'],
      // add more tables and fields as needed
    };

    const validFields = fieldList[table] || [];
    const entries = Object.entries(body).filter(([key]) => validFields.includes(key));

    if (entries.length === 0) {
      throw new Error("No valid fields to update");
    }

    // const setClauses = entries.map(([key]) => `${key} = ?`).join(', ');
    // const values = entries.map(([_, value]) => value);
    const itemsToPatch = Object.entries(body)
    console.log(" in Patch", itemsToPatch);
    const patch = itemsToPatch.map(entry => `${entry[0]} = ${typeof entry[1] === 'string' ? `"${entry[1]}"` : entry[1]}`).join(" ,");
    console.log("patch pathchy", patch);
    
    const sql = `UPDATE \`${table}\` SET ${patch} WHERE ${whereClause}`;
    const [result] = await db.query(sql, [id]);
    console.log("sql", sql, "ID", id, "res", result);
    return result;
  }

  static async validateInfo(amount_data) {
    // Implement your schema validation logic here
    // Example:
    // return amountSchema.validate(amount_data);
    return true; // placeholder
  }
}

export default General;