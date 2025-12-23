import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        itemId: String,
        name: String,
        price: Number,
        quantity: Number
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        customerId: String,
        items: [orderItemSchema],
        totalPrice: Number,
        status: {
            type: String,
            enum: ["NEW", "PREPARING", "READY", "DELIVERED"],
            default: "NEW"
        }
    },
    {timestamps: true}
);

export default mongoose.model("Order", orderSchema);