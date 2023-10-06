import express from "express";
import blockflow from "../controllers/blockflow.controller.js";

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/", blockflow.create);

router.get("/client", blockflow.findAllClientBlockflows);

router.get("/:id", blockflow.findOne);

router.put("/removeCredentials", blockflow.removeCredentials);

router.put("/:id", blockflow.update);

router.post("/test/:id", blockflow.test);

router.delete("/:id", blockflow.delete);

router.delete("/deleteAll", blockflow.deleteAll);

export default router;
