export const parseMessage = (text) => {
  if (!text) return { type: "UNKNOWN" };

  const normalized = text.trim().toLowerCase();

  // Greetings
  if (/^(hi|hello|hey)$/i.test(normalized)) {
    return { type: "GREET" };
  }

  // Menu
  if (normalized === "menu") {
    return { type: "SHOW_MENU" };
  }

  // Add item: add <name> <qty>
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

  // Done adding
  if (normalized === "done") {
    return { type: "DONE_ADDING" };
  }

  // Confirm order
  if (normalized === "confirm" || normalized === "yes") {
    return { type: "CONFIRM_YES" };
  }

  // Post-order actions
  if (normalized === "status" || normalized === "track order") {
    return { type: "CHECK_STATUS" };
  }

  if (normalized === "new order") {
    return { type: "NEW_ORDER" };
  }

  if (normalized === "order history") {
    return { type: "ORDER_HISTORY" };
  }

  return { type: "UNKNOWN" };
};