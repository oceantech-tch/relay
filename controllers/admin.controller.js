import Order from "../models/Order.js";
import messagingService from "../services/messaging.service.js";
import { getStatusMessage } from "../utils/orderStatusMessage.js";

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const message = getStatusMessage(order.orderId, status);

        await messagingService.send(order.customerId, message);

        return res.json(order);
    } catch (e) {
        console.error("Error updating order status:", e);
        return res.status(500).json({
            message: "Encountered internal server error"
        })
    }
}

export const getOrders = async (req, res) => {
    try {
        console.log("fetching orders...")
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
        console.log("orders fetched.")
    } catch (e) {
        console.error("Error fetching orders:", e);
        return res.status(500).json({
            message: "Encountered internal server error"
        })
    }
};