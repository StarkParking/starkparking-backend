const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    address: { type: String, required: true },
    decimals: { type: Number, required: true }
});

module.exports = mongoose.model('Token', tokenSchema);