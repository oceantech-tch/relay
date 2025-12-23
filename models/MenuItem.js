import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
    {
        name: String,
        price: Number,
        available: {
            type: Boolean,
            default: true
        },
    },
    {timestamps: true}
);

export default mongoose.model("MenuItem", menuItemSchema);