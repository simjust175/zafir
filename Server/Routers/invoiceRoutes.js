import express from "express";
//~ES5~ const express = require("express");
const route = express.Router();

import AmountControllers from "../Controllers/amountControllers.js";
import GeneralService from "../Services/generalService.js";
import GeneralControllers from "../Controllers/generalControllers.js";
import AmountService from "../Services/amountService.js";
//import auth from "../middleware/auth.js"


//get filtered
route.get("/filtered/:db", GeneralControllers.getFilteredGeneral)

//POST
route.post("/post", AmountControllers.postAmount);

//POST
route.post("/post-general/:db", GeneralControllers.postGeneral);

//POST new email/project
route.post("/newproject", AmountControllers.postNewEmail);

//POST new email/project
route.post("/add-to-existing-email", AmountControllers.postToExitingEmail);

//Get
route.post("/get", AmountControllers.getAmounts);

//Get emails not connected to projects
route.get("/freeEmails", AmountControllers.getFreeEmails)

//Get projects
route.get("/projects/:db", GeneralService.getMultipleFilteredService);

//Get payment
route.get("/payments", AmountControllers.getPayments);

//Patch
route.patch("/patch/:db", GeneralControllers.patch)

//~ES5~ module.exports = route
export default route;