import db from "../../Database/config/db.js"
import joi from "joi";
import JWT from 'jsonwebtoken'
import { config } from 'dotenv'
config()

class Register {

    //Common Function

    static async getByEmail(body) {
        const sql = `SELECT * FROM users where user_email = ?`;
        const [userNameAvailable] = await db.query(sql, [body.user_email]);
        console.log("userAvailible", sql, userNameAvailable);
        return userNameAvailable;
    };

    static async patchUser(id, body) {
        const user = Object.entries(body)
        const patch = user.map(entry => `${entry[0]} = ${typeof entry[1] === 'string' ? `"${entry[1]}"` : entry[1]}`).join(" ,");
        const sql = `UPDATE users SET ${patch} WHERE user_id = ?`;
        const [patchedUser, _] = await db.query(sql, [id]);
        console.log("sql", sql);
        
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
    static async verifyLoggedInByToken(user_email, token){
        const sql = "SELECT user_email, token FROM users WHERE user_email = ? AND token = ?"
        const [tokenIsValid, _] = await db.query(sql, [user_email, token]);
        return tokenIsValid;
    }


    static async forgotPwd(user_email){

        const sql = "SELECT user_email FROM users WHERE user_email = ? AND token = ?"
        const [tokenIsValid, _] = await db.query(sql, [user_email]);
        return tokenIsValid;
    }

}

export default Register;