export const generateOrderId = () => {
    const random = Math.floor(1000 + Math.random() * 90000);
    return `ORD-${random}`;
}