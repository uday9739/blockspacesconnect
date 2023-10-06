import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import connectors from "../controllers/connectors.controller.js";

router.post("/", connectors.create);

router.get("/", connectors.findAll);

router.get("/:id", connectors.findOne);

router.put("/:id", connectors.update);

router.delete("/:id", connectors.delete);

router.delete("/", connectors.deleteAll);

router.get("/system/:system", connectors.findAllForSystem);

export default router;
