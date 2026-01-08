import RegisterService from "../services/registerService.js"

class RegisterControllers {

    //post
    static async postNewUser({ body }, res) {

        try {
            const addNew = await RegisterService.registerNewUser(body);
            if (!addNew) res.status(404).json({ Error: "[in Controller/postNewUser] Not found" })
            res.status(200).json({ Success: `New user ${body.user_email} added successfully`, addNew });
        } catch (error) {
            res.status(500).json({ message: `[In Services/registerService] : Cannot post client: ${error.message}` });
        };
    };

    //log-in 
    static async userLogin({ body }, res) {
        try {
            const newToken = await RegisterService.loginUser(body);
            if (!newToken) return res.status(401).json({ Error: "Auth failed." });
            res.status(200).json({ Success: "Auth successful", newToken });
        } catch (error) {
            res.status(500).json({ message: `userService/userLoginService: Cannot login ${error.message}` });
        };
    };
    //log-out 
    static async userLogout({ params }, res) {
        try {
            const removeToken = await RegisterService.logoutUser(params);
            if (!removeToken) return res.status(401).json({ Error: "[registerControllers/userLogout] token" });
            res.status(200).json({ Success: "Successful removed token" });
        } catch (error) {
            res.status(500).json({ message: `userService/userLogoutService: Cannot logout ${error.message}` });
        };
    };

    // //patch
    // static async patchUser({ body, params: { id } }, res) {
    //     try {
    //         await usersService.patchService(id, body);
    //         res.status(201).json({ Success: `Successfully PATCHED client: ${id}`, patchedClient });
    //     } catch (error) {
    //         res.status(500).json({ Error: `Controllers: Cannot patch ${error.message}` });
    //     };
    // };

    //validate Token
    static async validateLoggedInController({ body }, res) {
        try {
            const isTokenValid = await RegisterService.verifyLoggedInService(body);
            if (!isTokenValid) return res.status(401).json({ Error: "[registerControllers/validateLoggedInController token" });
            res.status(201).json({ Success: "user validated" });
        } catch (error) {
            res.status(500).json({ Error: `Controllers: cannot verify token: ${error.message}` });
        };
    };

    static async forgotPwd({ body }, res) {
        try {

            const result = await RegisterService.forgotPwdService(body);
            if (!result)
                return res.status(404).json({ Error: "User not found" });


            res.status(200).json({
                Success: "Password reset email sent"
            });

        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    }

   static async resetPwd({ body }, res) {

    try {
        const updated = await RegisterService.resetPwdService(body);

        if (!updated)
            return res.status(400).json({ Error: "Invalid or expired reset token" });

        res.status(200).json({
            Success: "Password updated",
            user_id: updated.user_id,
            email: updated.email
        });

    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
}


}

export default RegisterControllers