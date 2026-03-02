const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  cardDetails: {
    cardNumber: { type: String },
    cardHolderName: { type: String },
    expiryDate: { type: String },
    cvv: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
