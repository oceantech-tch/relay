import axios from "axios";

const messagingService = {
  async send(to, text) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v24.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: to,                // 👈 this must be message.from
          type: "text",
          text: {
            body: text
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data;
    } catch (error) {
      // This log is IMPORTANT for debugging delivery issues
      console.error(
        "WhatsApp send error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export default messagingService;