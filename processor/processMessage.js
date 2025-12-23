export const processMessage = ({ session, command }) => {
  console.log(
    "PROCESS MESSAGE:",
    "STATE =", session.state,
    "COMMAND =", command.type
  );

  let nextSession = { ...session };
  let actions = [];
  let userResponse = "";

  if (nextSession.state === "IDLE") {
    if (command.type === "SHOW_MENU") {
      nextSession.state = "BROWSING_MENU";
      userResponse = "Available items:\n- Burger (2000)\n- Pizza (3000)";
    } else {
      userResponse = "Send 'menu' to see available items.";
    }
  }

  else if (nextSession.state === "BROWSING_MENU") {
    if (command.type === "ADD_ITEM") {
      nextSession.cart.push({
        itemId: command.payload.itemName,
        name: command.payload.itemName,
        price: command.payload.itemName === "burger" ? 2000 : 3000,
        quantity: command.payload.quantity
      });

      nextSession.state = "BUILDING_CART";
      userResponse = "Item added. Send 'confirm' to place order.";
    } else {
      userResponse = "Use 'add <item> <qty>' to add items.";
    }
  }

  else if (nextSession.state === "BUILDING_CART") {
    if (command.type === "ADD_ITEM") {
      nextSession.cart.push({
        itemId: command.payload.itemName,
        name: command.payload.itemName,
        price: command.payload.itemName === "burger" ? 2000 : 3000,
        quantity: command.payload.quantity
      });

      userResponse = "Item added. Send 'confirm' when ready.";
    }

    if (command.type === "CONFIRM_ORDER") {
      nextSession.state = "CONFIRMING_ORDER";
      userResponse = "Are you sure you want to place the order? Reply 'yes'.";
    }
  }

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
      userResponse = "Reply 'yes' to confirm the order.";
    }
  }

  else if (nextSession.state === "ORDER_PLACED") {
    userResponse = "Your order is already being processed.";
  }

  console.log("PROCESS RESULT:", {
    nextState: nextSession.state,
    cartSize: nextSession.cart.length,
    actions
  });

  return {
    nextSession,
    actions,
    userResponse
  };
};

// REMEMBER TO REMOVE UNNECESSARY CONSOLE.LOG

