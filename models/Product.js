import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Number,
            required: true
        },
        available: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

export default mongoose.model("Product", productSchema);