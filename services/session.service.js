import ChatSession from "../models/ChatSession.js";

const sessionService = {
    async get(customerId) {
    return ChatSession.findOne({ customerId });
    },

    async save(session) {
        const { customerId, state, cart, expiresAt } = session;

        return ChatSession.findOneAndUpdate(
            { customerId },
            {
            $set: {
                customerId,
                state,
                cart,
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