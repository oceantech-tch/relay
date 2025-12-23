import mongoose from "mongoose";

const processedMessageSchema = new mongoose.Schema(

    {
        messageId: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now }
    },
    {timestamps: true}
);

export default mongoose.model("ProcessedMessage", processedMessageSchema);