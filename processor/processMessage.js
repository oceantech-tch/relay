import productService from "../services/product.service.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export const processMessage = async ({ session, command }) => {
  const nextSession = {
    customerId: session.customerId,
    state: session.state || "IDLE",
    cart: Array.isArray(session.cart) ? session.cart : []
  };

  let actions = [];
  let userResponse = null;

  // ───────────── IDLE ─────────────
  if (nextSession.state === "IDLE") {
    if (command.type === "GREET") {
      userResponse =
        "Welcome 👋\n\n" +
        "What would you like to do?\n" +
        "- Reply 'menu' to view products\n" +
        "- Reply 'order history' to view past orders";
    }

    else if (command.type === "SHOW_MENU") {
      const products = await productService.getAvailableProducts();

      if (!products.length) {
        userResponse = "No products available at the moment.";
      } else {
        userResponse = {
          type: "MULTI_MESSAGE",
          messages: [
            "Available products:\n" +
              products
                .map((p) => `- ${p.name} (${formatCurrency(p.price)})`)
                .join("\n"),
            "Add items using: add <name> <qty>\nType 'done' when finished."
          ]
        };
        nextSession.state = "BUILDING_CART";
      }
    }

    else if (command.type === "ORDER_HISTORY") {
      actions.push({
        type: "FETCH_ORDER_HISTORY",
        payload: { customerId: nextSession.customerId }
      });
    }

    else {
      userResponse = "Reply 'menu' to view available products.";
    }
  }

  // ───────────── BUILDING_CART ─────────────
  else if (nextSession.state === "BUILDING_CART") {
    if (command.type === "ADD_ITEM") {
      const product = await productService.findByName(
        command.payload.itemName
      );

      if (!product) {
        userResponse = "Item not found. Please check the name.";
      } else {
        nextSession.cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: command.payload.quantity
        });

        userResponse = "Item added. Add more or type 'done'.";
      }
    }

    else if (command.type === "DONE_ADDING") {
      if (!nextSession.cart.length) {
        userResponse = "Your cart is empty.";
      } else {
        const summary = nextSession.cart
          .map(
            (i) =>
              `${i.name} x${i.quantity} (${formatCurrency(
                i.price * i.quantity
              )})`
          )
          .join("\n");

        userResponse =
          "Order summary:\n" +
          summary +
          "\n\nType 'confirm' to place your order.";

        nextSession.state = "CONFIRMING_ORDER";
      }
    }

    else {
      userResponse =
        "Add items using 'add <name> <qty>' or type 'done'.";
    }
  }

  // ───────────── CONFIRMING_ORDER ─────────────
  else if (nextSession.state === "CONFIRMING_ORDER") {
    if (command.type === "CONFIRM_YES") {
      actions.push({
        type: "CREATE_ORDER",
        payload: {
          customerId: nextSession.customerId,
          items: nextSession.cart
        }
      });

      nextSession.cart = [];
      nextSession.state = "ORDER_PLACED";

      userResponse =
        "📥 Order received successfully.\n" +
        "We’ll notify you once it’s confirmed.";
    } else {
      userResponse = "Reply 'confirm' to place your order.";
    }
  }

  // ───────────── ORDER_PLACED ─────────────
  else if (nextSession.state === "ORDER_PLACED") {
    if (command.type === "CHECK_STATUS") {
      actions.push({
        type: "FETCH_ORDER_STATUS",
        payload: {
          customerId: nextSession.customerId,
          orderId: command.payload.orderId
        }
      });
    }

    else if (command.type === "ORDER_HISTORY") {
      actions.push({
        type: "FETCH_ORDER_HISTORY",
        payload: { customerId: nextSession.customerId }
      });
    }

    else if (command.type === "NEW_ORDER") {
      nextSession.state = "IDLE";
      userResponse = "Sure 👍 Reply 'menu' to start a new order.";
    }

    else {
      userResponse =
        "Your order is being processed.\n\n" +
        "Options:\n" +
        "- Reply 'status <orderId>' to check status\n" +
        "- Reply 'order history' to view past orders\n" +
        "- Reply 'new order' to place another order";
    }
  }

  return { nextSession, actions, userResponse };
};