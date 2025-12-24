import { describe, it, expect } from "vitest";
import { processMessage } from "../processor/processMessage.js";

describe("processMessage state machine", () => {

  it("shows menu from IDLE", () => {
    const session = {
      customerId: "U1",
      state: "IDLE",
      cart: []
    };

    const command = { type: "SHOW_MENU" };

    const result = processMessage({ session, command });

    expect(result.nextSession.state).toBe("BROWSING_MENU");
    expect(result.userResponse).toContain("Available items");
    expect(result.actions.length).toBe(0);
  });

  it("adds item in BROWSING_MENU", () => {
    const session = {
      customerId: "U1",
      state: "BROWSING_MENU",
      cart: []
    };

    const command = {
      type: "ADD_ITEM",
      payload: { itemName: "burger", quantity: 2 }
    };

    const result = await processMessage({ session, command });

    expect(result.nextSession.state).toBe("BUILDING_CART");
    expect(result.nextSession.cart.length).toBe(1);
    expect(result.nextSession.cart[0].quantity).toBe(2);
  });

  it("moves to confirmation", () => {
    const session = {
      customerId: "U1",
      state: "BUILDING_CART",
      cart: [{ name: "burger", price: 2000, quantity: 1 }]
    };

    const command = { type: "CONFIRM_ORDER" };

    const result = processMessage({ session, command });

    expect(result.nextSession.state).toBe("CONFIRMING_ORDER");
    expect(result.userResponse).toContain("Reply 'yes'");
  });

  it("creates order on confirmation yes", () => {
    const session = {
      customerId: "U1",
      state: "CONFIRMING_ORDER",
      cart: [{ name: "burger", price: 2000, quantity: 1 }]
    };

    const command = { type: "CONFIRM_YES" };

    const result = processMessage({ session, command });

    expect(result.actions.length).toBe(1);
    expect(result.actions[0].type).toBe("CREATE_ORDER");
    expect(result.nextSession.state).toBe("ORDER_PLACED");
    expect(result.nextSession.cart.length).toBe(0);
  });

});