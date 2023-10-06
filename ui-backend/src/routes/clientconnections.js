import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import clientconnections from "../controllers/clientconnections.controller.cjs";

router.post("/", clientconnections.create);
router.get("/getAll/:clientid", clientconnections.findAll);
router.get("/:id", clientconnections.findOne);
router.put("/:id", clientconnections.update);
router.delete("/:id", clientconnections.delete);
router.delete("/deleteAll/:clientid", clientconnections.deleteAll);

export default router;
