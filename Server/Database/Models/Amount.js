import db from "../config/db.js";
import joi from "joi";
//~ES5~ const db = require("db");
//~ES5~ const joi = require("joi");

const isNotDeleted = "deleted_at IS NULL";

class Amount {
  static async validateInfo(amount_data) {
    const amountSchema = joi.object({
      amount: joi.number().required(),
    });
    return amountSchema.validate(amount_data);
  }

  static async postAmount(body) {
    const INSERT_amount = "INSERT INTO invoices SET ?";
    const [amountInserted, _] = await db.query(INSERT_amount, [body]);
    return amountInserted;
  }

  static async ValidateByToken(token) {
    const sql = "SELECT user_id FROM users WHERE token = ?";
    const [user_id, _] = await db.query(sql, [token]);
    return user_id;
  }

  static async GetAmounts() {
    const SELECT_amounts = `SELECT 
  *,
  invoices.created_at AS invoice_date
FROM projects
LEFT JOIN invoices 
  ON invoices.project = projects.project_id AND invoices.deleted_at IS NULL
WHERE 
  projects.deleted_at IS NULL
  AND projects.completed_on IS NULL;`; //user = ? AND
    const [amountSelected] = await db.query(SELECT_amounts); //, [user_id]
    return amountSelected;
  }
  static async getFreeEmails() {
    const SELECT_amounts = `SELECT e.email AS email_address, e.password AS password, e.email_id AS email_id
FROM emails e
WHERE NOT EXISTS (
  SELECT 1
  FROM projects p
  WHERE p.email = e.email_id
    AND p.completed_on IS NULL
);`;
    const [amountSelected] = await db.query(SELECT_amounts); //, [user_id]
    return amountSelected;
  }

  static async getProjectId(email) {
    const Select_projectId = `Select project_id FROM projects WHERE email = ? AND completed_on IS NULL`;
    const [projectId] = await db.query(Select_projectId, [email]);
    return projectId;
  }

  static async getPayments(table) {
    const sql = `SELECT ${table}.amount, ${table}.project, ${table}.created_on, projects.project_name FROM ${table} INNER JOIN projects ON ${table}.project = projects.project_id WHERE projects.completed_on IS NULL;`;
    const [payments, _] = await db.execute(sql);
    return payments;
  }


}

//~ES5~ module.export = AmountModel
export default Amount;