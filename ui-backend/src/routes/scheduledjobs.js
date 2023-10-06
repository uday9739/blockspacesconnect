import express from "express";
import scheduledjobs from "../controllers/scheduledjobs.controller.js";

// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/getAll/:clientid", scheduledjobs.findAll);
router.get("/:id", scheduledjobs.findOne);
router.delete("/:id", scheduledjobs.delete);
router.delete("/deleteAll/:clientid", scheduledjobs.deleteAll);

export default router;
