import express from "express";
import { getOrders, updateOrderStatus } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/orders", getOrders);
router.patch("/orders':id/status", updateOrderStatus);

export default router;