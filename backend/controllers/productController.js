const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, description, stock, photo } = req.body;
        
        const product = await Product.create({
            name,
            category,
            price,
            description,
            stock,
            photo
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error in createProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { name, category, price, description, stock, photo } = req.body;
        
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.price = price !== undefined ? price : product.price;
        product.description = description !== undefined ? description : product.description;
        product.stock = stock !== undefined ? stock : product.stock;
        if (photo !== undefined) product.photo = photo;

        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();

        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
