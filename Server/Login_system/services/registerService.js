import Register from "../models/register.js";
import bcrypt from "bcrypt";

class RegisterService {
    static async registerNewUser(body) {
        //[step 1] JOI
        const isValueValid = await Register.validateUserData(body);
        console.log("in register is value valid", isValueValid);
        if (isValueValid.error) throw new Error(isValueValid.error.details[0].message);
        try {
            //[step 2] check availability (front-end has to have the user name as "user_email")
            const isUserTaken = await Register.getByEmail(body);
            if (isUserTaken.length > 0) throw new Error("Try a different User-name");

            //[step 3] hash password (front-end's password must be named "pwd")
            const salt = await bcrypt.genSalt();
            body.pwd = await bcrypt.hash(body.pwd, salt);

            //[step 4] post the new user🎆
            const newUser = await Register.postNewUser(body);
            if (!newUser) return null
            return newUser
        } catch (error) {
            throw new Error(error)
        }
    };


    // ~~~~~~~~~~~~~~~~~~~~ || LOG-IN || ~~~~~~~~~~~~~~~~~~~~ \\
    static async loginUser(body) {
        const isDataValid = await Register.validateUserData(body);
        const dataFromDB = await Register.getByEmail(body);
        if (!isDataValid || dataFromDB.length === 0) throw new Error("invalid user name");
        const [{ user_email, pwd, user_id }] = dataFromDB;
        try {
            const isCredentialsValid = await bcrypt.compare(body.pwd, pwd);
            console.log("validity", isCredentialsValid);
            if (!isCredentialsValid) return null;
            const newToken = { token: await Register.GenerateToken(user_email, pwd) };//, active: true
            await Register.patchUser(user_id, newToken);
            return { newToken, user_id };
        } catch (error) {
            throw new Error(error);
        }
    };

    static async logoutUser(params) {
        if (!params.user_email) throw new Error("email must be provided")
        try {
            const { user_id } = await Register.getByEmail(params)
            //const setStatusAsInactive = await Register.patchUser(user_id)//, {active: false}
            const removeToken = await Register.patchUser(user_id, { token: "" });
            //console.log("user status:", setStatusAsInactive);
            return removeToken;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async verifyLoggedInService({ user_email, token }) {
        if (!user_email || !token) throw new Error("You must be logged in to access info.")
        try {
            const isTokenValid = await Register.verifyLoggedInByToken(user_email, token);
            console.log("is the token valid: ", isTokenValid.length > 1);
            if (isTokenValid.length < 1) return null;
            console.log("its valid: ", isTokenValid);
            return true
        } catch (error) {
            throw new Error(error);
        }
    }

    static async patchUser(id, body){
        if(!id || !body) throw new Error("Id and Body must be provided.", error)
        try {
            const patch = Register.patchUser(id, body);
            if(!patch) return null
            return patch
        } catch (error) {
            throw new Error(error);
        }
    }

}

export default RegisterService