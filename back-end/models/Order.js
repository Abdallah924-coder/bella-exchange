const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['ACHAT', 'VENTE'],
    required: true
  },
  crypto: {
    type: String,
    enum: ['BTC', 'ETH', 'BNB', 'USDT'],
    required: true
  },
  amountUSD: {
    type: Number,
    required: true
  },
  amountCFA: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  screenshotUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['EN_ATTENTE', 'EN_COURS', 'COMPLETEE', 'ANNULEE'],
    default: 'EN_ATTENTE'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);