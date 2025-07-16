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
    const SELECT_amounts = `SELECT *, invoices.created_at AS invoice_date FROM invoices INNER JOIN projects ON invoices.project = projects.project_id WHERE invoices.deleted_at IS NULL AND projects.deleted_at IS NULL;`; //user = ? AND
    const [amountSelected] = await db.query(SELECT_amounts); //, [user_id]
    return amountSelected;
  }

  static async getProjectId(email) {
    const Select_projectId = `Select project_id FROM projects WHERE email = ? AND ${isNotDeleted}`;
    const [projectId] = await db.query(Select_projectId, [email]);
    return projectId;
  }
}

//~ES5~ module.export = AmountModel
export default Amount;