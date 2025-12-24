export const parseMessage = (text) => {
  if (!text) return { type: "UNKNOWN" };

  const normalized = text.trim().toLowerCase();

  if (/^(hi|hello|hey)$/i.test(normalized)) {
    return { type: "GREET" };
  }

  if (normalized === "menu") {
    return { type: "SHOW_MENU" };
  }

  if (normalized.startsWith("add ")) {
    const parts = normalized.split(" ");
    const quantity = Number(parts[parts.length - 1]);

    if (!Number.isNaN(quantity)) {
      const itemName = parts.slice(1, -1).join(" ");
      return {
        type: "ADD_ITEM",
        payload: { itemName, quantity }
      };
    }
  }

  if (normalized === "done") {
    return { type: "DONE_ADDING" };
  }

  if (normalized === "confirm" || normalized === "yes") {
    return { type: "CONFIRM_YES" };
  }

  if (normalized.startsWith("status ")) {
    const orderId = normalized.replace("status ", "").trim();
    return {
      type: "CHECK_STATUS",
      payload: { orderId }
    };
  }

  if (normalized === "order history") {
    return { type: "ORDER_HISTORY" };
  }

  if (normalized === "new order") {
    return { type: "NEW_ORDER" };
  }

  return { type: "UNKNOWN" };
};