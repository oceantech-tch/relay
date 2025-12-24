import express from "express";

import { parseMessage } from "../processor/parseMessage.js";
import { processMessage } from "../processor/processMessage.js";

import sessionService from "../services/session.service.js";
import createOrder from "../services/order.service.js";
import messagingService from "../services/messaging.service.js";

import { isDuplicate } from "../utils/idempotency.js";
import { SESSION_TTL_MS } from "../utils/sessionExpiry.js";
import { generateOrderId } from "../utils/orderId.js";

import { adaptWhatsAppPayload } from "../utils/whatsappAdapter.js";

const router = express.Router();
const NAIRA = "\u20A6";

/**
 * POST — Receive WhatsApp messages
 */
router.post("/", async (req, res) => {
  try {
    console.log(
      "RAW WEBHOOK BODY:",
      JSON.stringify(req.body, null, 2)
    );
    const payload = adaptWhatsAppPayload(req.body);

    // Ignore non-text or unsupported events
    if (!payload) {
      console.log("Webhook ignored by adapter");
      return res.sendStatus(200);
    }

    const { senderId, messageId, text } = payload;

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

    const { nextSession, actions, userResponse } =
      await processMessage({ session, command });

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
        `Order ${order.orderId} placed successfully. Total: ₦${totalPrice}`
      );
    }

    if (action.type === "FETCH_ORDER_HISTORY") {
      const orders = await Order.find({
        customerId: action.payload.customerId
      })
        .sort({ createdAt: -1 })
        .limit(5);

      if (orders.length === 0) {
        await messagingService.send(
          senderId,
          "You don’t have any previous orders yet."
        );
      } else {
        const history = orders
          .map((o) => `• ${o.orderId} – ${o.status}`)
          .join("\n");

        await messagingService.send(
          senderId,
          "Your recent orders:\n" + history
        );
      }
    }
  }

  // ───── Send user response ─────
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
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return res.sendStatus(500);
  }
});

export default router;