import RegisterControllers from '../controllers/registerControllers.js';
import express from 'express';

const route = express.Router();

route.post("/post", RegisterControllers.postNewUser);

route.post("/login", RegisterControllers.userLogin);

route.post("/logout/:user_email", RegisterControllers.userLogout);

route.post("/validateToken", RegisterControllers.validateLoggedInController);

route.post("/forgot_pwd", RegisterControllers.forgotPwd);

route.post("/reset", RegisterControllers.resetPwd);

route.post("/forgot", RegisterControllers.forgotPwd);

export default route;