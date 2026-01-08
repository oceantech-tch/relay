import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        itemId: String,
        name: String,
        price: Number,
        quantity: Number,
    },
    { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            required: true,
            unique: true
        },
        customerName: {
            type: String
        },
        state: {
            type: String,
            enum: [
                "IDLE",
                "BROWSING_MENU",
                "BUILDING_ORDER",
                "CONFIRMING_ORDER",
                "ORDER_PLACED"
            ],
            default: "IDLE"
        },
        hasGreeted: {
            type: Boolean,
            default: false
        },
        cart: [cartItemSchema],
        expiresAt: {
            type: Date,
            required: true
        },
    },
    {timestamps: true}
);

chatSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("ChatSession", chatSessionSchema);