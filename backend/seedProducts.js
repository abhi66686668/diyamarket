const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
    {
        name: 'EESL AC powered by Wybor',
        category: 'Home Appliances',
        price: 25000,
        description: 'Split Air Conditioner',
        stock: 10,
        photo: ''
    },
    {
        name: 'Havells Ceiling Fan',
        category: 'Electrical & Power',
        price: 2500,
        description: 'Brown ceiling fan with 3 blades',
        stock: 20,
        photo: ''
    },
    {
        name: 'ARVCO Refrigerator',
        category: 'Home Appliances',
        price: 15000,
        description: 'Double door stainless steel refrigerator',
        stock: 5,
        photo: ''
    },
    {
        name: 'Luminous Inverter & Battery',
        category: 'Electrical & Power',
        price: 18000,
        description: 'Inverlast 180Ah Tall Tubular Battery with Hercules 1600 Inverter',
        stock: 8,
        photo: ''
    },
    {
        name: 'LED Smart Lamp',
        category: 'Lighting',
        price: 500,
        description: 'WiFi ready smart LED bulb',
        stock: 50,
        photo: ''
    }
];

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB Connected');
    await Product.insertMany(products);
    console.log('Products added successfully!');
    process.exit();
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});
