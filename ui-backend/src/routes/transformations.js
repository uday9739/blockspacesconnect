import express from "express";
import transformations from "../controllers/transformations.controller.js";

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/math/add", transformations.numberAdd);

router.post("/math/subtract", transformations.numberSubtract);

router.post("/math/multiply", transformations.numberMultiply);

router.post("/math/divide", transformations.numberDivide);

router.post("/math/toString", transformations.numberToString);

router.post("/string/concatenate", transformations.stringConcatenate);

router.post("/string/substring", transformations.stringSubstring);

router.post("/string/split", transformations.stringSplit);

router.post("/string/upperCase", transformations.stringToUpperCase);

router.post("/string/lowerCase", transformations.stringToLowerCase);

router.post("/string/toNumber", transformations.stringToNumber);

router.post("/array/iterate", transformations.arrayIteration);

// router.post("/array/filter", transformations.arrayFilter);

export default router;
