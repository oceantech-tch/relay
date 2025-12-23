const messagingService = {
    async send(to, message) {
        console.log(`Sending message to ${to}: ${message}`);
    }
};

export default messagingService;