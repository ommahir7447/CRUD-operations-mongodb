const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce_db';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB (MVC Config)...');
    } catch (err) {
        console.error('Could not connect to MongoDB...', err);
        process.exit(1);
    }
};

module.exports = connectDB;
