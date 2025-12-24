import productService from "../services/product.service.js";

export const processMessage = async ({ session, command }) => {
  const nextSession = {
    customerId: session.customerId,
    state: session.state || "IDLE",
    cart: Array.isArray(session.cart) ? session.cart : []
  };

  let actions = [];
  let userResponse = "";

  // IDLE
  if (nextSession.state === "IDLE") {
    if (command.type === "SHOW_MENU") {
      const products = await productService.getAvailableProducts();

      if (products.length === 0) {
        userResponse = "No products available at the moment.";
      } else {
        userResponse =
          "Available products:\n" +
          products
            .map((p) => `- ${p.name} (${p.price})`)
            .join("\n") +
          "\n\nAdd items using: add <name> <qty>\nType 'done' when finished.";
      }

      nextSession.state = "BUILDING_CART";
    } else {
      userResponse = "Send 'menu' to see available products.";
    }
  }

  // BUILDING_CART
  else if (nextSession.state === "BUILDING_CART") {
    if (command.type === "ADD_ITEM") {
      const product = await productService.findByName(command.payload.itemName);

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
      userResponse = "Add items using 'add <name> <qty>' or type 'done'.";
    }
  }

  // CONFIRMING_ORDER
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
      userResponse = "Order confirmed.";
    } else {
      userResponse = "Reply 'yes' to confirm your order.";
    }
  }

  // ORDER_PLACED
  else if (nextSession.state === "ORDER_PLACED") {
    userResponse = "Your order is already being processed.";
  }

  return { nextSession, actions, userResponse };
};