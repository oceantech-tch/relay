import express from "express";

import { parseMessage } from "../processor/parseMessage.js";
import { processMessage } from "../processor/processMessage.js";

import sessionService from "../services/session.service.js";
import createOrder from "../services/order.service.js";
import messagingService from "../services/messaging.service.js";

import Order from "../models/Order.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getOrderStatusLabel } from "../utils/orderStatusLabel.js";

import { isDuplicate } from "../utils/idempotency.js";
import { SESSION_TTL_MS } from "../utils/sessionExpiry.js";
import { generateOrderId } from "../utils/orderId.js";
import { adaptWhatsAppPayload } from "../utils/whatsappAdapter.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = adaptWhatsAppPayload(req.body);
    if (!payload) return res.sendStatus(200);

    const { senderId, messageId, text, customerName } = payload;

    const duplicate = await isDuplicate(messageId);
    if (duplicate) return res.sendStatus(200);

    const now = Date.now();
    let session = await sessionService.get({"DETTING SESSION:", senderId, "CUSTOMER ID:", customerId});
    console.log("SESSION FROM STORE:", session)

    if (!session || session.expiresAt < now) {
      session = {
        customerId: senderId,
        customerName: customerName || null,
        state: "IDLE",
        cart: [],
        hasGreeted: false,
        expiresAt: new Date(now + SESSION_TTL_MS)
      };
    }

    if (customerName && !session.customerName) {
      session.customerName = customerName;
    }

    const command = parseMessage(text);
    const { nextSession, actions, userResponse } =
      await processMessage({ session, command });

    await sessionService.save({
      ...nextSession,
      customerName: nextSession.customerName,
      expiresAt: new Date(now + SESSION_TTL_MS),
    },
    console.log("SAVING SESSION:", session.customerId, session.hasGreeted)
  );

    // ───────── ACTIONS ─────────
    for (const action of actions) {

      // CREATE ORDER
      if (action.type === "CREATE_ORDER") {
        const totalPrice = action.payload.items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        const order = await createOrder({
          orderId: generateOrderId(),
          customerId: action.payload.customerId,
          items: action.payload.items,
          totalPrice,
          status: "PENDING CONFIRMATION"
        });

        await messagingService.send(
          senderId,
          `✅ Order placed successfully\n\n` +
          `Order ID: ${order.orderId}\n` +
          `Total: ${formatCurrency(order.totalPrice)}\n\n` +
          `Status: Pending confirmation`
        );
      }

      // ORDER HISTORY
      if (action.type === "FETCH_ORDER_HISTORY") {
        const orders = await Order.find({
          customerId: action.payload.customerId
        }).sort({ createdAt: -1 });

        if (!orders.length) {
          await messagingService.send(
            senderId,
            "You have no previous orders. Reply 'menu' to place an order"
          );
        } else {
          const history = orders.map((o) => {
            const items = o.items
              .map((i) => `${i.name} x${i.quantity}`)
              .join(", ");

            return (
              `🧾 Order ID: ${o.orderId}\n` +
              `Items: ${items}\n` +
              `Total: ${formatCurrency(o.totalPrice)}\n` +
              `Status: ${getOrderStatusLabel(o.status)}\n` +
              `Date: ${new Date(o.createdAt).toLocaleString()}`
            );
          }).join("\n\n────────────\n\n");

          await messagingService.send(
            senderId,
            "Your order history:\n\n" + history
          );
        }
      }

      // ORDER STATUS
      if (action.type === "FETCH_ORDER_STATUS") {
        const order = await Order.findOne({
          orderId: action.payload.orderId,
          customerId: action.payload.customerId
        });

        if (!order) {
          await messagingService.send(
            senderId,
            "⏳ Your order is still being processed.\n" +
            "If you just placed it, please wait a moment and try again."
          );
        } else {
          await messagingService.send(
            senderId,
            `📦 Order Status\n\n` +
            `Order ID: ${order.orderId}\n` +
            `Status: ${getOrderStatusLabel(order.status)}\n` +
            `Total: ${formatCurrency(order.totalPrice)}`
          );
        }
      }

      // cancel order
      if (action.type === "CANCEL_ORDER") {
        const order = await Order.findOne({
          orderId: action.payload.orderId.toUpperCase(),
          customerId: action.payload.customerId
        });

        if (!order) {
          await messagingService.send(
            senderId,
            "❌ Order not found. Please check the Order ID."
          );
          continue;
        }

        if (order.status !== "PENDING CONFIRMATION") {
          await messagingService.send(
            senderId,
            "🚫 This order can no longer be cancelled because it has already been confirmed or processed."
          );
          continue;
        }

        order.status = "CANCELLED";
        await order.save();

        await messagingService.send(
          senderId,
          `🛑 Order cancelled successfully.\n\nOrder ID: ${order.orderId}`
        );
      }
    }

    // ───────── USER RESPONSE ─────────
    if (userResponse) {
      if (typeof userResponse === "string") {
        await messagingService.send(senderId, userResponse);
      }

      if (userResponse.type === "MULTI_MESSAGE") {
        for (const msg of userResponse.messages) {
          await messagingService.send(senderId, msg);
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return res.sendStatus(500);
  }
});

export default router;
