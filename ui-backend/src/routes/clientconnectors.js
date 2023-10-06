import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import clientconnectors from "../controllers/clientconnectors.controller.cjs";

router.post("/", clientconnectors.create);
router.get("/getAll/:clientid", clientconnectors.findAll);
router.get("/:id", clientconnectors.findOne);
router.put("/:id", clientconnectors.update);
router.delete("/:id", clientconnectors.delete);
router.delete("/deleteAll/:clientid", clientconnectors.deleteAll);

export default router;
