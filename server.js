import dotenvx from "@dotenvx/dotenvx";
import express from "express";
import connectDb from "./config/connectDb.js";
import whatsappWebhook from "./webhooks/whatsapp.webhook.js";
import whatsappVerify from "./webhooks/whatsapp.verify.js";
import adminRoutes from "./routes/admin.routes.js";

dotenvx.config();

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json({ status: "Relay API is running" })
})

app.use("/webhooks/whatsapp", whatsappVerify);
app.use("/webhooks/whatsapp", whatsappWebhook);
app.use("/admin", adminRoutes);

const startServer = async () => {
    await connectDb();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
};

startServer();
