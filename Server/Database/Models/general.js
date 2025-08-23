import db from "../config/db.js";

const isNotDeleted = "`deleted_at` IS NULL";
const allowedTables = ["emails", "invoices", "projects", "users", "payments", "invoicing"];

function validateTable(table) {
  if (!allowedTables.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
}

class General {
  static async get(table) {
    validateTable(table);
    const sql = `SELECT * FROM \`${table}\` WHERE ${isNotDeleted}`;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getWithFilter(table, columns = "*", whereClause = "", params = []) {
    validateTable(table);

    const selectedColumns = Array.isArray(columns)
      ? columns.map(col => `\`${col}\``).join(", ")
      : columns;

    let sql = `SELECT ${selectedColumns} FROM \`${table}\` WHERE ${isNotDeleted}`;
    if (whereClause) sql += ` AND ${whereClause}`;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getMultipleFilteredGroups(table, columns = "*", filterField = "id", filterValues = []) {
    validateTable(table);
    if (!Array.isArray(filterValues) || filterValues.length === 0) return [];

    const selectedColumns = Array.isArray(columns)
      ? columns.map(col => `\`${col}\``).join(", ")
      : columns;

    const placeholders = filterValues.map(() => "?").join(", ");
    const whereClause = `\`${filterField}\` IN (${placeholders})`;

    const sql = `SELECT ${selectedColumns} FROM \`${table}\` WHERE ${isNotDeleted} AND ${whereClause}`;
    const [rows] = await db.query(sql, filterValues);

    // Group rows by filterField
    return rows.reduce((acc, row) => {
      const key = row[filterField];
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }

  static async post(table, body) {
    validateTable(table);

    const sqlInsert = `INSERT INTO \`${table}\` SET ?`;
    const [result] = await db.query(sqlInsert, [body]);

    if (!result.insertId) {
      throw new Error("Insert failed");
    }

    const idField = table === "invoicing" ? "invoicing_id" : `${table.slice(0, -1)}_id`;
    const sqlSelect = `SELECT * FROM \`${table}\` WHERE ${idField} = ?`;
    const [rows] = await db.query(sqlSelect, [result.insertId]);

    return rows[0];
  }

  static async patch(table, body, whereClause, params = []) {
    validateTable(table);

    const fieldWhitelist = {
      invoices: ["issuer", "amount", "includesBtw", "btwPercent", "margin", "deleted_at", "double_checked"],
      projects: ["project_name", "amount_invoiced", "amount_paid", "completed_on"],
      payments: ["payment_amount"],
      invoicing: ["invoicing_amount"],
      users: ["deleted_at", "user_name", "user_email"]
    };

    const validFields = fieldWhitelist[table] || [];
    const updates = Object.entries(body).filter(([key]) => validFields.includes(key));

    if (updates.length === 0) {
      throw new Error(`No valid fields to update for table: ${table}`);
    }

    const setClause = updates.map(([key]) => `\`${key}\` = ?`).join(", ");
    const values = updates.map(([, value]) => value);

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
    const [result] = await db.query(sql, [...values, ...params]);

    return result;
  }
}

export default General;