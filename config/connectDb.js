import mongoose from "mongoose";

const connectDb = async () => {
    const mongoUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected!");
    } catch (e) {
        console.error("MongoDB connection failed:", e.message);
        process.exit(1);
    }
};

export default connectDb;