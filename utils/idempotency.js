import ProcessedMessage from "../models/ProcessedMessage.js";

export const isDuplicate = async (messageId) => {
    const exists = await ProcessedMessage.findOne({ messageId });
    if (exists) return true;

    await ProcessedMessage.create({ messageId });
    return false;
};