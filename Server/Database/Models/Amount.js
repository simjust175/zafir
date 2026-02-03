import db from "../config/db.js";

class Amount {
  static async postAmount(body) {
    const sql = "INSERT INTO invoices SET ?";
    const [result] = await db.query(sql, [body]);
    return result;
  }

  static async validateByToken(token) {
    const sql = "SELECT user_id FROM users WHERE token = ?";
    const [rows] = await db.query(sql, [token]);
    console.log("in models/validateByToken", rows);
    return rows;
  }

  static async getAmounts() {
    const sql = `
      SELECT 
        *,
        invoices.created_at AS invoice_date
      FROM projects
      LEFT JOIN invoices 
        ON invoices.project = projects.project_id 
        AND invoices.deleted_at IS NULL
      WHERE projects.deleted_at IS NULL
      AND projects.completed_on IS NULL;
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getFreeEmails() {
    const sql = `
      SELECT e.email AS email_address, e.email_id
      FROM emails e
      WHERE NOT EXISTS (
        SELECT 1 FROM projects p
        WHERE p.email = e.email_id
        AND p.completed_on IS NULL
      );
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getActiveEmails() {
    const sql = `
      SELECT e.email_id, e.password, e.email AS email_address, p.project_id
      FROM projects p
      INNER JOIN emails e ON p.email = e.email_id
      WHERE p.completed_on IS NULL;
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getProjectId(emailId) {
    const sql = "SELECT project_id FROM projects WHERE email = ? AND completed_on IS NULL";
    const [rows] = await db.query(sql, [emailId]);
    return rows;
  }

  static async getPayments(table) {
    const allowedTables = ["payments", "invoicing"];
    if (!allowedTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const idColumn = table === "payments" ? "payment_id" : "invoicing_id";

    // Logic: If table is invoicing, get the real column. 
    // If payments, return NULL so the frontend doesn't break.
    const invoiceNumSelector = table === "invoicing"
      ? "t.invoice_number"
      : "NULL AS invoice_number";

    const sql = `
    SELECT 
      t.${idColumn} AS id,
      t.amount,
      t.project,
      t.created_on,
      ${invoiceNumSelector},
      p.project_name
    FROM \`${table}\` t
    INNER JOIN projects p ON t.project = p.project_id
    WHERE p.completed_on IS NULL AND t.deleted_at IS NULL;
  `;

    const [rows] = await db.query(sql);
    return rows;
  }
}

export default Amount;