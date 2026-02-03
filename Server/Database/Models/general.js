import db from "../config/db.js";

/**
 * Table metadata
 * - id: primary key column
 * - softDelete: whether deleted_at exists
 */
const TABLE_META = {
  invoices: { id: "invoice_id", softDelete: true },
  projects: { id: "project_id", softDelete: true },
  users: { id: "user_id", softDelete: true },
  emails: { id: "email_id", softDelete: true },

  payments: { id: "payment_id", softDelete: true },
  invoicing: { id: "invoicing_id", softDelete: true },
};

const REVENUE_TABLES = ["payments", "invoicing"];

function validateTable(table) {
  if (!TABLE_META[table]) {
    throw new Error(`Invalid table name: ${table}`);
  }
}

function assertSafeWhereClause(whereClause) {
  if (!whereClause) return;
  if (whereClause.includes(";")) {
    throw new Error("Invalid WHERE clause");
  }
}

class General {
  /* ---------- GET ---------- */
  static async get(table) {
    validateTable(table);
    const meta = TABLE_META[table];

    let sql = `SELECT * FROM \`${table}\``;
    if (meta.softDelete) {
      sql += ` WHERE deleted_at IS NULL`;
    }

    const [rows] = await db.query(sql);
    return rows;
  }

  /* ---------- GET WITH FILTER ---------- */
  static async getWithFilter(table, columns = "*", whereClause = "", params = []) {
    validateTable(table);
    assertSafeWhereClause(whereClause);

    const meta = TABLE_META[table];

    const selectedColumns = Array.isArray(columns)
      ? columns.map(c => `\`${c}\``).join(", ")
      : columns;

    let sql = `SELECT ${selectedColumns} FROM \`${table}\``;

    const conditions = [];
    if (meta.softDelete) {
      conditions.push("deleted_at IS NULL");
    }
    if (whereClause) {
      conditions.push(whereClause);
    }

    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  /* ---------- INSERT ---------- */
  static async post(table, body) {
    console.log("body body", body);
    
    validateTable(table);
    const meta = TABLE_META[table];

    const [result] = await db.query(
      `INSERT INTO \`${table}\` SET ?`,
      body
    );

    if (!result.insertId) {
      throw new Error("Insert failed");
    }

    const [rows] = await db.query(
      `SELECT * FROM \`${table}\` WHERE \`${meta.id}\` = ?`,
      [result.insertId]
    );

    return rows[0];
  }

  /* ---------- PATCH ---------- */
  static async patch(table, body, whereClause, params = []) {
    validateTable(table);
    assertSafeWhereClause(whereClause);

    const FIELD_WHITELIST = {
      invoices: [
        "issuer",
        "amount",
        "includesBtw",
        "btwPercent",
        "margin",
        "deleted_at",
        "double_checked",
        "conflict_resolved",
      ],
      projects: [
        "project_name",
        "amount_invoiced",
        "amount_paid",
        "completed_on",
        "deleted_at",
        "margin",
      ],
      payments: ["amount", "deleted_at"],
      invoicing: ["amount", "deleted_at"],
      users: ["deleted_at", "user_name", "user_email"],
      emails: ["deleted_at", "email", "password"],
    };

    const allowed = FIELD_WHITELIST[table] || [];
    const updates = Object.entries(body).filter(([k]) =>
      allowed.includes(k)
    );

    if (!updates.length) {
      throw new Error(`No valid fields to update for ${table}`);
    }

    const setClause = updates
      .map(([key]) => `\`${key}\` = ?`)
      .join(", ");

    const values = updates.map(([, v]) => v);

    const sql = `
      UPDATE \`${table}\`
      SET ${setClause}
      WHERE ${whereClause}
    `;

    await db.query(sql, [...values, ...params]);
    return true;
  }

  /* ---------- REVENUE BY PROJECT ---------- */
  static async getByProject(table, projectId) {
    validateTable(table);

    if (!REVENUE_TABLES.includes(table)) {
      throw new Error("Invalid revenue table");
    }

    const meta = TABLE_META[table];

    const sql = `
      SELECT
        \`${meta.id}\` AS id,
        project,
        amount,
        created_on
      FROM \`${table}\`
      WHERE project = ?
      ORDER BY created_on DESC
    `;

    const [rows] = await db.query(sql, [projectId]);
    return rows;
  }

  /* ---------- SOFT DELETE ---------- */
  static async softDelete(table, id) {
    validateTable(table);
    const meta = TABLE_META[table];

    if (!meta.softDelete) {
      throw new Error(`Table '${table}' does not support soft delete`);
    }


    if (id === undefined || id === null || isNaN(Number(id))) {
      throw new Error(`Invalid ID for soft delete: ${id}`);
    }

    const sql = `
      UPDATE \`${table}\`
      SET deleted_at = NOW()
      WHERE \`${meta.id}\` = ?
    `;

    await db.query(sql, [id]);
    return true;
  }
}

export default General;