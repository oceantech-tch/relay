export const adaptWhatsAppPayload = (body) => {
  try {
    if (!body.entry || !body.entry.length) {
      return null;
    }

    const change = body.entry[0].changes?.[0];
    if (!change) {
      return null;
    }

    const value = change.value;

    if (!value.messages || !value.messages.length) {
      return null;
    }

    const message = value.messages[0];

    if (message.type !== "text") {
      return null;
    }

    return {
      senderId: message.from,
      messageId: message.id,
      text: message.text.body
    };
  } catch (err) {
    console.error("WhatsApp adapter error:", err);
    return null;
  }
};