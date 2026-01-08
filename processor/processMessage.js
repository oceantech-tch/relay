import productService from "../services/product.service.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export const processMessage = async ({ session, command }) => {
  const nextSession = {
    customerId: session.customerId,
	customerName: session.customerName || null,
    state: session.state || "IDLE",
    cart: Array.isArray(session.cart) ? session.cart : [],
    hasGreeted: session.hasGreeted || false
  };

  let actions = [];
  let userResponse = null;

  // ───── CANCEL CURRENT FLOW (ANYTIME BEFORE CONFIRMATION) ─────
  if (command.type === "CANCEL_FLOW") {
    nextSession.state = "IDLE";
    nextSession.cart = [];

    return {
      nextSession,
      actions,
      userResponse: "❌ Operation cancelled. Reply 'menu' to start again."
    };
  }

  // ───── GLOBAL COMMANDS (WORK IN ANY STATE) ─────
  if (command.type === "ORDER_HISTORY") {
    actions.push({
      type: "FETCH_ORDER_HISTORY",
      payload: { customerId: nextSession.customerId }
    });

    return { nextSession, actions, userResponse: null };
  }

  if (command.type === "CHECK_STATUS") {
    actions.push({
      type: "FETCH_ORDER_STATUS",
      payload: {
        customerId: nextSession.customerId,
        orderId: command.payload.orderId
      }
    });

    return { nextSession, actions, userResponse: null };
  }

  if (command.type === "CANCEL_ORDER") {
    actions.push({
      type: "CANCEL_ORDER",
      payload: {
        customerId: nextSession.customerId,
        orderId: command.payload.orderId
      }
    });

    return { nextSession, actions, userResponse: null };
  }

  if (command.type === "NEW_ORDER") {
    nextSession.state = "IDLE";
    nextSession.cart = [];

    return {
      nextSession,
      actions,
      userResponse: "Sure 👍 Reply 'menu' to start a new order."
    };
  }

  // ───────────── IDLE ─────────────
  if (nextSession.state === "IDLE") {
    if (command.type === "GREET") {
      if (!nextSession.hasGreeted) {
        nextSession.hasGreeted = true;

        const name = nextSession.customerName || "there";
        return {
          nextSession,
          actions,
          userResponse:
            `Welcome ${name} 👋\n\n` +
            "Reply:\n" +
            "- 'menu' to view products\n" +
            "- 'order history' to view past orders\n" +
            "- 'status <orderId>' to check an order";
        };
      }
        return {
          nextSession,
          actions,
          userResponse: "Reply 'menu' to continue 🙂"
        };
    }

    else if (command.type === "SHOW_MENU") {
      const products = await productService.getAvailableProducts();

      if (!products.length) {
        userResponse = "No products available right now.";
      } else {
        userResponse =
          "Available products:\n" +
          products
            .map((p) => `- ${p.name} (${formatCurrency(p.price)})`)
            .join("\n") +
          "\n\nAdd items using: add <name> <qty>\nType 'done' when finished.";

        nextSession.state = "BUILDING_CART";
      }
    }

    else {
      userResponse = "Reply 'menu' to begin.";
    }
  }

  // ───────────── BUILDING_CART ─────────────
  else if (nextSession.state === "BUILDING_CART") {

    if (command.type === "VIEW_CART") {
      if (!nextSession.cart.length) {
        userResponse = "🛒 Your cart is empty.";
      } else {
        const cartView = nextSession.cart
          .map(
            (i) =>
              `${i.name} x${i.quantity} (${formatCurrency(
                i.price * i.quantity
              )})`
          )
          .join("\n");

        userResponse = "🛒 Your cart:\n\n" + cartView;
      }
    }

    else if (command.type === "DELETE_ITEM") {
      const before = nextSession.cart.length;

      nextSession.cart = nextSession.cart.filter(
        (i) => i.name.toLowerCase() !== command.payload.itemName
      );

      if (before === nextSession.cart.length) {
        userResponse = "Item not found in cart.";
      } else {
        userResponse = "Item removed from cart.";
      }
    }

    else if (command.type === "ADD_ITEM") {
      const product = await productService.findByName(
        command.payload.itemName
      );

      if (!product) {
        userResponse = "Item not found.";
      } else {
        nextSession.cart.push({
          itemId: product._id,
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
          "\n\nReply 'confirm' to place order or 'cancel' to abort.";

        nextSession.state = "CONFIRMING_ORDER";
      }
    }

    else {
      userResponse =
        "Use 'add', 'delete', 'view cart', 'done', or 'cancel'.";
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
      userResponse =
        "Reply 'confirm' to place order or 'cancel' to abort.";
    }
  }

  // ───────────── ORDER_PLACED ─────────────
  else if (nextSession.state === "ORDER_PLACED") {
    userResponse =
      "Your order is being processed.\n\n" +
      "Options:\n" +
      "- status <orderId>\n" +
      "- cancel order <orderId>\n" +
      "- order history\n" +
      "- new order";
  }

  return { nextSession, actions, userResponse };
};
