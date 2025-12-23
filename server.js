import dotenvx from "@dotenvx/dotenvx";
import app from "./app.js";
import connectDb from "./config/connectDB.js";

dotenvx.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectDb();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
};

startServer();