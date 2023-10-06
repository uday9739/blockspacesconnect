import express from "express";
import transactionsController from "../controllers/transactions.controller.js";
let controller = new transactionsController();
const router = express.Router();

router.get("/",controller.stubTransaction);
router.get("/:transactionId",controller.readTransaction);
router.post("/",controller.writeTransaction);
router.put("/:transactionId/:status/:completedOn?",controller.updateTransaction);

export default router;
