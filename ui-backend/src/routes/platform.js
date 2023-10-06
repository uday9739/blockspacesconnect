import express from "express";
const router = express.Router();
import {platformController} from "../controllers/platform.controller.js";

let controller = new platformController();

router.get("/", controller.platformDescription);
router.get("/status",controller.status);

export default router;