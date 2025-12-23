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

    console.log("\n--- NEW WEBHOOK REQUEST ---");
    console.log("RAW BODY:", req.body);

    if (!senderId || !messageId || !text) {
      console.log("INVALID PAYLOAD");
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    // 1. Idempotency
    const duplicate = await isDuplicate(messageId);
    console.log("IDEMPOTENCY CHECK:", duplicate);

    if (duplicate) {
      console.log("DUPLICATE MESSAGE — SKIPPING");
      return res.sendStatus(200);
    }

    // 2. Load session
    const now = Date.now();
    let session = await sessionService.get(senderId);

    console.log("SESSION FROM DB:", session);

    if (!session) {
      console.log("NO SESSION — CREATING NEW ONE");
      session = {
        customerId: senderId,
        state: "IDLE",
        cart: [],
        expiresAt: new Date(now + SESSION_TTL_MS)
      };
    } else if (session.expiresAt < now) {
      console.log("SESSION EXPIRED — RESETTING");
      session.state = "IDLE";
      session.cart = [];
    }

    console.log("SESSION BEFORE PROCESS:", session);

    // 3. Parse message
    const command = parseMessage(text);
    console.log("PARSED COMMAND:", command);

    // 4. Process message
    const { nextSession, actions, userResponse } = processMessage({
      session,
      command,
      now
    });

    console.log("NEXT SESSION:", nextSession);
    console.log("ACTIONS RETURNED:", actions);
    console.log("USER RESPONSE:", userResponse);

    // 5. Save session
    await sessionService.save({
      ...nextSession,
      expiresAt: new Date(now + SESSION_TTL_MS)
    });

    console.log("SESSION SAVED");

    // 6. Execute actions
    for (const action of actions) {
      if (action.type === "CREATE_ORDER") {
        console.log("CREATING ORDER WITH PAYLOAD:", action.payload);

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

        console.log("ORDER CREATED:", order);

        await messagingService.send(
          senderId,
          `Order ${order.orderId} placed successfully. Total: ${NAIRA}${totalPrice}`
        );
      }
    }

    // 7. Send user response
    if (userResponse) {
      await messagingService.send(senderId, userResponse);
      console.log("USER MESSAGE SENT");
    }

    console.log("--- REQUEST COMPLETE ---\n");
    return res.sendStatus(200);
  } catch (error) {
    console.error("WHATSAPP WEBHOOK ERROR:", error);
    return res.sendStatus(500);
  }
});

export default router;

// REMEMBER TO REMOVE ANY UNNECESSARY CONSOLE.LOG