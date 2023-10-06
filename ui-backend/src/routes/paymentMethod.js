import * as express from 'express';
import controller from '../controllers/paymentMethod.controller';


const router = express.Router();

//api/paymentInfo/list/
router.get("/list/", controller.list);
//api/paymentInfo/:id
router.post("/", controller.create);
//api/paymentInfo/:id
router.get("/:id", controller.read);
//api/paymentInfo/:id/delete
router.delete("/:id", controller.delete);


export default router;