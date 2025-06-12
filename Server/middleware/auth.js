import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const auth = (req, res, next) => {
    let token = req.headers['authorization'];
    if(!token) throw new Error(`at Auth: not authorized, no token provided`);
    
    try {
        token = token.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        //verify user_id
        
    } catch (error) {
        console.error(`In auth.js: Error in validating token: ${error}.`);
        //next(error);
    };
    return next();
};

export default auth;