const mongoose = require("mongoose");

const stockSchema = mongoose.Schema({
  date: { type: Date, required: true },
  open: { type: String, required: true },
  high: { type: String, required: true },
  low: { type: String, required: true },
  close: { type: String, required: true }
});

module.exports = mongoose.model("Stock", stockSchema);