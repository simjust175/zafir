import express from "express";
//~ES5~ const express = require("express");
const route = express.Router();

import AmountControllers from "../Controllers/amountControllers.js";
import GeneralService from "../Services/generalService.js";
import GeneralControllers from "../Controllers/generalControllers.js";
//import auth from "../middleware/auth.js"


//POST
route.post("/post", AmountControllers.postAmount);

//POST new email/project
route.post("/newproject", AmountControllers.postNewEmail);

//Get
route.post("/get", AmountControllers.getAmounts);

//Get filtered
route.get("/projects/:db", GeneralService.getMultipleFilteredService);

//Patch
route.patch("/patch/:db", GeneralControllers.patch)

//~ES5~ module.exports = route
export default route;