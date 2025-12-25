import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    customerId: {
      type: String,
      required: true
    },

    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],

    totalPrice: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "PENDING CONFIRMATION",
        "CONFIRMED",
        "REJECTED",
        "PREPARING",
        "READY",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PENDING CONFIRMATION"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);