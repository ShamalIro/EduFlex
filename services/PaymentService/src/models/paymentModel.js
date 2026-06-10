const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  course_id: {
    type: String,
    required: true
  },
  course_title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  stripe_payment_intent_id: {
    type: String,
    default: null
  },
  payment_method: {
    type: String,
    default: 'card'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);