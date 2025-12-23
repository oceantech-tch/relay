export const getStatusMessage = (orderId, status) => {
    if (status === "PREPARING") {
        return `Order ${orderId} is being prepared, thanks for understanding.`;
    }

    if (status === "READY") {
        return `Order ${orderId} is ready for delivery.`;
    }

    if (status === "DELIVERED") {
        return `ORDER ${orderId} has been delivered.`;
    }

    return `Order ${orderId} status updated to ${status}.`;
};