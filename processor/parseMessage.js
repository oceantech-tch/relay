export const parseMessage = (text) => {
  const input = text.trim().toLowerCase();

  // greetings
  if (input === "hi" || input === "hello" || input === "hey") {
    return { type: "GREET" };
  }

  // menu
  if (input === "menu") {
    return { type: "SHOW_MENU" };
  }

  // cancel current flow
  if (input === "cancel") {
    return { type: "CANCEL_FLOW" };
  }

  // view cart
  if (input === "view cart") {
    return { type: "VIEW_CART" };
  }

  // delete item
  if (input.startsWith("delete ")) {
    return {
      type: "DELETE_ITEM",
      payload: {
        itemName: input.replace("delete ", "").trim()
      }
    };
  }

  // add item
  if (input.startsWith("add ")) {
    const parts = input.replace("add ", "").split(" ");
    const quantity = parseInt(parts.pop(), 10);
    const itemName = parts.join(" ");

    if (!itemName || isNaN(quantity)) {
      return { type: "INVALID" };
    }

    return {
      type: "ADD_ITEM",
      payload: { itemName, quantity }
    };
  }

  // done adding
  if (input === "done") {
    return { type: "DONE_ADDING" };
  }

  // confirm
  if (input === "confirm") {
    return { type: "CONFIRM_YES" };
  }

  // new order
  if (input === "new order") {
    return { type: "NEW_ORDER" };
  }

  // order history
  if (input === "order history") {
    return { type: "ORDER_HISTORY" };
  }

  // cancel order
  if (input.startsWith("cancel order ")) {
    console.log(input)
    const orderId = input
    .replace(/cancel order/i, "")
    .trim()
    .toUpperCase();

    return {
      type: "CANCEL_ORDER",
      payload: {
        orderId
      }
    };
  }

  // status ORD-xxxx
  if (input.startsWith("status ")) {
    return {
      type: "CHECK_STATUS",
      payload: { orderId: input.replace("status ", "").trim() }
    };
  }

  return { type: "UNKNOWN" };
};