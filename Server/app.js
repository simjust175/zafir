import express from "express"
const app= express();

import dotenv from "dotenv";
dotenv.config()

import cors from "cors";

import invoiceRoutes from "./Routers/invoiceRoutes.js";
import RegisterRoutes from "./Login_system/Router/registerRoutes.js"

//listen to emails
import startListening from "./email-service/imap.js";
startListening()

const port = process.env.PORT || 1221;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/invoice", invoiceRoutes)
app.use("/register", RegisterRoutes)


app.listen(port, ()=>{
    console.log("Get-rich is running on port -", port);
})