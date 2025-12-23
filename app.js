import express from "express";
import whatsappWebhook from "./webhooks/whatsapp.webhook.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(express.json());

app.use("/webhooks/whatsapp", whatsappWebhook);
app.use("/admin", adminRoutes);

export default app;