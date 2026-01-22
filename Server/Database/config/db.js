import mysql2 from "mysql2";
import { config } from "dotenv";
config();

//~ES5~  const mysql2 = require("mysql2");
//~ES5~  const dotenv = require("dotenv");
//~ES5~  dotenv.config();

const db_config ={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
};

// console.log("🔍 DB config:", db_config);
const pool = mysql2.createPool(db_config);

//~ES5~ module.exports = pool.promise();
export default pool.promise();