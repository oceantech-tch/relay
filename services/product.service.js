import Product from "../models/Product.js";

const productService = {
    async getAvailableProducts() {
        return Product.find({ available: true });
    },

    async findByName(name) {
        return Product.findOne({
            name: new RegExp(`^${name}$`, "i"),
            available: true
        });
    }
};

export default productService;