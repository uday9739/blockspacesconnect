import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import systems from "../controllers/systems.controller.js";

router.post("/", systems.create);

router.get("/", systems.findAll);

router.get("/:id", systems.findOne);

router.put("/:id", systems.update);

router.delete("/:id", systems.delete);

router.delete("/", systems.deleteAll);

export default router;
