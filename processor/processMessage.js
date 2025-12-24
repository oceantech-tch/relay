import productService from "../services/product.service.js";

export const processMessage = async ({ session, command }) => {
  const nextSession = {
    customerId: session.customerId,
    state: session.state || "IDLE",
    cart: Array.isArray(session.cart) ? session.cart : []
  };

  let actions = [];
  let userResponse = null;

  // ───────────────── IDLE ─────────────────
  if (nextSession.state === "IDLE") {
    if (command.type === "GREET") {
      userResponse =
        "Hi there 👋 Welcome to OceanTech Watch Store.\n\n" +
        "What would you like to do?\n" +
        "- Reply 'menu' to view available products\n" +
        "- Reply 'order history' to view past orders";
    }

    else if (command.type === "SHOW_MENU") {
      const products = await productService.getAvailableProducts();

      if (products.length === 0) {
        userResponse = "No products available at the moment.";
      } else {
        userResponse = {
          type: "MULTI_MESSAGE",
          messages: [
            "Available products:\n" +
              products
                .map((p) => `- ${p.name} (${p.price})`)
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
      userResponse = "Fetching your order history…";
    }

    else {
      userResponse = "Reply 'menu' to view available products.";
    }
  }

  // ─────────────── BUILDING_CART ───────────────
  else if (nextSession.state === "BUILDING_CART") {
    if (command.type === "ADD_ITEM") {
      const product = await productService.findByName(
        command.payload.itemName
      );

      if (!product) {
        userResponse = "Item not found. Please check the name and try again.";
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
      if (nextSession.cart.length === 0) {
        userResponse = "Your cart is empty. Add at least one item.";
      } else {
        const summary = nextSession.cart
          .map((i) => `${i.name} x${i.quantity}`)
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

  // ─────────────── CONFIRMING_ORDER ───────────────
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
      userResponse = "Order confirmed ✅";
    } else {
      userResponse = "Reply 'confirm' to place your order.";
    }
  }

  // ─────────────── ORDER_PLACED ───────────────
  else if (nextSession.state === "ORDER_PLACED") {
    if (command.type === "CHECK_STATUS") {
      userResponse =
        "Your order is currently being processed.\n" +
        "You’ll receive updates here.";
    }

    else if (command.type === "NEW_ORDER") {
      nextSession.state = "IDLE";
      userResponse = "Sure 👍 Reply 'menu' to start a new order.";
    }

    else if (command.type === "ORDER_HISTORY") {
      actions.push({
        type: "FETCH_ORDER_HISTORY",
        payload: { customerId: nextSession.customerId }
      });
      userResponse = "Fetching your order history…";
    }

    else {
      userResponse =
        "Your order is already being processed.\n\n" +
        "What would you like to do?\n" +
        "- Reply 'status' to check order status\n" +
        "- Reply 'new order' to place another order\n" +
        "- Reply 'order history' to view past orders";
    }
  }

  return { nextSession, actions, userResponse };
};