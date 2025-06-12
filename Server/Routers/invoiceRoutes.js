import express from "express";
//~ES5~ const express = require("express");
const route = express.Router();

import AmountControllers from "../Controllers/amountControllers.js";
//import auth from "../middleware/auth.js"



route.post("/post", AmountControllers.postAmount);

route.post("/get", AmountControllers.getAmounts);

//~ES5~ module.exports = route
export default route;