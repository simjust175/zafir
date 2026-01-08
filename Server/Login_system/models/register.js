import db from "../../Database/config/db.js"
import joi from "joi";
import JWT from 'jsonwebtoken'
import { config } from 'dotenv'
config()

class Register {

    //Common Function
    static async getByEmail(body) {
        const sql = `SELECT * FROM users where user_email = ? AND deleted_at IS NULL`;
        const [userNameAvailable] = await db.query(sql, [body.user_email]);
        return userNameAvailable;
    };

    static async patchUser(id, body) {
        const fields = Object.keys(body);
        const values = Object.values(body);

        // Build placeholders for each field
        const placeholders = fields.map(field => `${field} = ?`).join(", ");

        const sql = `UPDATE users SET ${placeholders} WHERE user_id = ?`;
        const [patchedUser] = await db.query(sql, [...values, id]);

        return patchedUser;
    }

    // ~~~~~~  // 🆕 REGISTER 📋 \\ ~~~~~~~ \\

    //JOI
    static async validateUserData(body) {
        const registerSchema = joi.object({
            user_email: joi.string().email().required(),
            user_name: joi.string(),
            pwd: joi.required()
        })
        return registerSchema.validate(body);
    }

    //Check user-name availability

    //Post (register) new user 👤
    static async postNewUser(body) {
        const sql = `INSERT INTO users SET ?`;
        const [newUser, _] = await db.query(sql, [body]);
        return newUser;
    };

    // ~~~~~~  // 🔒 LOG-IN 🔓 \\ ~~~~~~~ \\

    //[step 1] use the GET function to get the info of the user matching the "user_email" to compare the pwd.

    //[step 2] Token
    static async GenerateToken(user_email, pwd) {
        return JWT.sign(
            {
                user_email: user_email,
                user_pwd: pwd
            },
            process.env.JWT_SECRET
        );
    };

    //[step 3] verify id by again using the GET function and passing the Token as a extra measure?.
    //[step 4] insert the newly formed token using the PATCH method


    //~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    static async verifyLoggedInByToken(user_email, token) {
        const sql = "SELECT user_email, token FROM users WHERE user_email = ? AND token = ?"
        const [tokenIsValid, _] = await db.query(sql, [user_email, token]);
        return tokenIsValid;
    }


    static async forgotPwd(user_email) {
        const sql = "SELECT user_id, user_email FROM users WHERE user_email = ? AND deleted_at IS NULL";
        const [rows] = await db.query(sql, [user_email]);
        return rows;
    }

    // Verify reset token
    static async verifyResetToken(reset_token) {
    const sql = `
      SELECT user_id, user_email 
      FROM users 
      WHERE reset_token = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(sql, [reset_token]);
    return rows;
}

    // Clear reset token after password change
    static async clearResetToken(user_id) {
        const sql = "UPDATE users SET reset_token = NULL WHERE user_id = ?";
        const [result] = await db.query(sql, [user_id]);
        return result;
    }

}

export default Register;