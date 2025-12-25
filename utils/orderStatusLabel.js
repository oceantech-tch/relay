export const getOrderStatusLabel = (status) => {
  if (status === "PENDING CONFIRMATION") {
    return "Pending confirmation";
  }

  if (status === "PREPARING") {
    return "Preparing YOUR your order";
  }

  if (status === "READY") {
    return "Ready for delivery";
  }

  if (status === "DELIVERED") {
    return "Delivered";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  return "Unknown status";
};