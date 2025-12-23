export const parseMessage = (text = "") => {
    const input = text.toLowerCase().trim();

    if (["menu", "hi", "start", "hello"].includes(input)) {
        return { type: "SHOW_MENU" }
    }

    if (input.startsWith("add")) {
        const parts = input.split(" ");
        const itemName = parts[1];
        const quantity = Number(parts[2]) || 1;

        return {
            type: "ADD_ITEM",
            payload: { itemName, quantity }
        };
    }

    if (input === "confirm") {
        return { type: "CONFIRM_ORDER" }
    }

    if (input === "yes") {
        return { type: "CONFIRM_YES" }
    }

    if (input === "status") {
        return { type: "CHECK_STATUS" }
    }

    return { type: "UNKNOWN" };
};