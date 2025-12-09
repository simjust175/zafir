import db from "../config/db.js";

class Amount {
  static async postAmount(body) {
    const sql = "INSERT INTO invoices SET ?";
    const [result] = await db.query(sql, [body]);
    return result;
  }

  static async validateByToken(token) {
    console.log("in models/validateByToken", token);
    
    const sql = "SELECT user_id FROM users WHERE token = ?";
    const [rows] = await db.query(sql, [token]);
    return rows;
    console.log("in models/validateByToken", rows);
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
      SELECT e.email AS email_address, e.password, e.email_id
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
    const sql = `
      SELECT t.amount, t.project, t.created_on, p.project_name
      FROM ${table} t
      INNER JOIN projects p ON t.project = p.project_id
      WHERE p.completed_on IS NULL;
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
}

export default Amount;