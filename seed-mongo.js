const mongoose = require('mongoose');
require('./models/user');
require('./models/product');
require('./models/cart');
require('./models/order');

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce_db';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await mongoose.connection.db.dropDatabase();
        console.log('Database cleared.');

        const Product = mongoose.model('Product');
        const User = mongoose.model('User');
        const Cart = mongoose.model('Cart');
        const Order = mongoose.model('Order');

        // Seed Products
        const products = await Product.insertMany([
            { name: 'Laptop', price: 999.99, category: 'Electronics', stock: 10, description: 'High-performance laptop' },
            { name: 'Headphones', price: 149.99, category: 'Electronics', stock: 25, description: 'Noise-cancelling headphones' },
            { name: 'Coffee Maker', price: 79.99, category: 'Appliances', stock: 15, description: 'Programmable coffee maker' }
        ]);
        console.log('Products seeded.');

        // Seed Users
        const seededUsers = await User.insertMany([
            {
                email: 'john@example.com',
                name: 'John Doe',
                password: 'hashed_password_1',
                address: '123 Main St',
                cardDetails: {
                    cardNumber: '1234567812345678',
                    cardHolderName: 'John Doe',
                    expiryDate: '12/25',
                    cvv: '123'
                }
            },
            {
                email: 'jane@example.com',
                name: 'Jane Smith',
                password: 'hashed_password_2',
                address: '456 Oak Ave',
                cardDetails: {
                    cardNumber: '8765432187654321',
                    cardHolderName: 'Jane Smith',
                    expiryDate: '01/26',
                    cvv: '456'
                }
            }
        ]);
        console.log('Users seeded.');

        // Seed Carts
        await Cart.insertMany([
            {
                userId: seededUsers[0]._id,
                items: [
                    { productId: products[0]._id, quantity: 1 },
                    { productId: products[1]._id, quantity: 2 }
                ]
            },
            {
                userId: seededUsers[1]._id,
                items: [
                    { productId: products[2]._id, quantity: 1 }
                ]
            }
        ]);
        console.log('Carts seeded.');

        // Seed Orders
        await Order.insertMany([
            {
                userId: seededUsers[0]._id,
                items: [
                    {
                        productId: products[0]._id,
                        productName: products[0].name,
                        quantity: 1,
                        price: products[0].price,
                        subtotal: products[0].price
                    }
                ],
                total: products[0].price,
                shippingAddress: seededUsers[0].address,
                paymentMethod: 'Credit Card',
                cardDetails: seededUsers[0].cardDetails,
                status: 'delivered'
            }
        ]);
        console.log('Orders seeded.');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
