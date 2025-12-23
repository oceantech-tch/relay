import Order from "../models/Order.js";

const createOrder = async (orderData) => {
    return Order.create(orderData);
}

export default createOrder;