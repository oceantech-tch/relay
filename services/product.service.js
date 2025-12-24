import Product from "../models/Product.js";

const productService = {
    async getAvailableProducts() {
        const products = await Product.find({
            $or: [
                { available: true },
                { available: true }
            ]
        });
        return products;
    },

    async findByName(name) {
        return Product.findOne({
            name: new RegExp(name, "i"),
            $or: [
                { available: true },
                { available: true }
            ]
        });
    }
};

export default productService;