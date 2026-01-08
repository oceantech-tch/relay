import ChatSession from "../models/ChatSession.js";

const sessionService = {
    async get(customerId) {
    return ChatSession.findOne({ customerId });
    },

    async save(session) {
        const { customerId, customerName, state, cart, hasGreeted, expiresAt } = session;

        return ChatSession.findOneAndUpdate(
            { customerId },
            {
            $set: {
                customerId,
                customerName,
                state,
                cart,
                hasGreeted,
                expiresAt
            }
            },
            {
            upsert: true,
            new: true
            }
        );
    }
};

export default sessionService;