import express from "express";

import { parseMessage } from "../processor/parseMessage.js";
import { processMessage } from "../processor/processMessage.js";

import sessionService from "../services/session.service.js";
import createOrder from "../services/order.service.js";
import messagingService from "../services/messaging.service.js";

import { isDuplicate } from "../utils/idempotency.js";
import { SESSION_TTL_MS } from "../utils/sessionExpiry.js";
import { generateOrderId } from "../utils/orderId.js";

const router = express.Router();
const NAIRA = "\u20A6";

router.post("/", async (req, res) => {
  try {
    const { senderId, messageId, text } = req.body;

    if (!senderId || !messageId || !text) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    // Idempotency
    const duplicate = await isDuplicate(messageId);
    if (duplicate) {
      return res.sendStatus(200);
    }

    const now = Date.now();
    let session = await sessionService.get(senderId);

    if (!session) {
      session = {
        customerId: senderId,
        state: "IDLE",
        cart: [],
        expiresAt: new Date(now + SESSION_TTL_MS)
      };
    } else if (session.expiresAt < now) {
      session.state = "IDLE";
      session.cart = [];
    }

    const command = parseMessage(text);

    const { nextSession, actions, userResponse } = processMessage({
      session,
      command
    });

    await sessionService.save({
      ...nextSession,
      expiresAt: new Date(now + SESSION_TTL_MS)
    });

    for (const action of actions) {
      if (action.type === "CREATE_ORDER") {
        const totalPrice = action.payload.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const order = await createOrder({
          orderId: generateOrderId(),
          customerId: action.payload.customerId,
          items: action.payload.items,
          totalPrice,
          status: "NEW"
        });

        await messagingService.send(
          senderId,
          `Order ${order.orderId} placed successfully. Total: ${NAIRA}${totalPrice}`
        );
      }
    }

    if (userResponse) {
      await messagingService.send(senderId, userResponse);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return res.sendStatus(500);
  }
});

export default router;