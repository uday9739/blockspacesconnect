import express from "express";
import schedulerdefinition from "../controllers/schedulerdefinition.controller.js";

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/", schedulerdefinition.create);
router.get("/getAll/:clientid", schedulerdefinition.findAll);
router.get("/:id", schedulerdefinition.findOne);
router.put("/:id", schedulerdefinition.update);
router.delete("/:id", schedulerdefinition.delete);
router.delete("/deleteAll/:clientid", schedulerdefinition.deleteAll);
export default router;
