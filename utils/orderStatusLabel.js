export const getOrderStatusLabel = (status) => {
  switch (status) {
    case "NEW":
      return "Pending confirmation";
    case "PREPARING":
      return "Preparing";
    case "READY":
      return "Ready";
    case "DELIVERED":
      return "Delivered";
    default:
      return "Processing";
  }
};