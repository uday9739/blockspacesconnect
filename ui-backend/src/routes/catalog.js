import express from "express";
import catalogController from "../controllers/catalog.controller.js";


const router = express.Router();

router.get("/", catalogController.findAll);


export default router;
