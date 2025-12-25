import { formatCurrency } from "./formatCurrency.js";

export const getCustomerStatusMessage = (order) => {
  if (order.status === "CONFIRMED") {
    return (
      `✅ Order confirmed!\n\n` +
      `Order ID: ${order.orderId}\n` +
      `Total: ${formatCurrency(order.totalPrice)}`
    );
  }

  else if (order.status === "REJECTED") {
    return (
      `❌ Order rejected\n\n` +
      `Unfortunately, we cannot fulfill your order at this time.`
    );
  }

  else if (order.status === "PREPARING") {
    return "💫 Your order is now being prepared.";
  }

  else if (order.status === "READY") {
    return "📦 Your order is ready.";
  }

  else if (order.status === "DELIVERED") {
    return "🎉 Your order has been delivered. Thank you for your patronage!";
  }

  else if (order.status === "CANCELLED") {
    return "🛑 Your order has been cancelled.";
  }

  // NEW or any unexpected status
  else {
    return null;
  }
};