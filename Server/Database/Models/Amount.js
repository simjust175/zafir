import db from "../config/db.js"
import joi from "joi"
//~ES5~ const db = require("db");
//~ES5~ const joi = require("joi");

const isNotDeleted = "deleted_at IS NULL";

class Amount{
    static async validateInfo(amount_data){
        const amountSchema = joi.object({
            amount: joi.number().required()
        });
        return amountSchema.validate(amount_data)
    };

    static async postAmount(body){
        const INSERT_amount = "INSERT INTO amounts SET ?";
        const [amountInserted, _] = await db.query(INSERT_amount, [body]);
        console.log("IN MODELS:", amountInserted);
        return amountInserted;
    }

    static async ValidateByToken(token){
        const sql = "SELECT user_id FROM users WHERE token = ?";
        const [user_id, _] = await db.query(sql, [token]);
        return user_id;
    }

    static async GetAmounts(user_id){
        const SELECT_amounts = `SELECT * FROM amounts WHERE user = ? AND ${isNotDeleted}`;
        const [amountSelected, _] = await db.query(SELECT_amounts, [user_id]);
        return amountSelected;
    }
} 


//~ES5~ module.export = AmountModel
export default Amount;