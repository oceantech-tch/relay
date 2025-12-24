import Order from "../models/Order.js";
import messagingService from "../services/messaging.service.js";
import { getStatusMessage } from "../utils/orderStatusMessage.js";
import { isValidStatusTransition } from "../utils/orderStatusFlow.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!isValidStatusTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    const message = getStatusMessage(order.orderId, status);
    await messagingService.send(order.customerId, message);

    return res.json(order);
  } catch (e) {
    console.error("Error updating order status:", e);
    return res.status(500).json({
      message: "Encountered internal server error"
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (e) {
    console.error("Error fetching orders:", e);
    return res.status(500).json({
      message: "Encountered internal server error"
    });
  }
};