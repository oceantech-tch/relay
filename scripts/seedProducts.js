import dotenvx from "@dotenvx/dotenvx";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenvx.config();

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany();
await Product.insertMany([
    { name: "Air Jordan 1", price: 85000 },
    { name: "Nike Air Force 1", price: 90000 },
    { name: "Nike Dunk Low", price: 80000 },
    { name: "Nike Air Max 270", price: 130000 },
    { name: "Nike React Infinity Run", price: 160000 },
    { name: "Nike Zoom Pegasus 38", price: 120500 },
    { name: "Nike Blazer Mid", price: 85000 },
    { name: "Nike Cortez", price: 75900 },
    { name: "Nike Air Max 90", price: 110000 },
    { name: "Nike VaporMax", price: 190800 },
    { name: "Nike ZoomX Vaporfly", price: 250500 },
    { name: "Nike SB Dunk Low", price: 100200 },
    { name: "Nike Air Zoom Tempo", price: 120000 },
    { name: "Nike Free RN", price: 70950 },
    { name: "Nike Metcon", price: 110000 }
]);

console.log("Products seeded")
process.exit(0);