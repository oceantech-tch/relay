import dotenvx from "@dotenvx/dotenvx";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenvx.config();

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany();
await Product.insertMany([
    { name: "G-shock DW-5600", price: 85000 },
    { name: "Seiko 5", price: 120000 },
    { name: "Casio Vintage", price: 45000 },
]);

console.log("Products seeded")
process.exit(0);