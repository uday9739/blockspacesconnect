import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import clientCredentials from "../controllers/clientcredentials.controller.js";

router.post("/use", clientCredentials.use);

router.post("/:connector", clientCredentials.create);

router.get("/list/:connector", clientCredentials.list);

router.get("/:connector/:credentialId", clientCredentials.read);

router.delete("/:connector/:credentialId", clientCredentials.delete);

router.put("/:connector/:credentialId", clientCredentials.update);

export default router;
