const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');

// ─── Validation ────────────────────────────────────────────────────────────────
const paymentValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('cardNumber')
    .notEmpty().withMessage('Card number is required')
    .isLength({ min: 13, max: 19 }).withMessage('Card number must be between 13 and 19 digits')
    .matches(/^[\d\s]+$/).withMessage('Card number must contain only digits'),
  body('cardName')
    .trim()
    .notEmpty().withMessage('Cardholder name is required'),
  body('expiry')
    .notEmpty().withMessage('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry must be in MM/YY format'),
  body('cvv')
    .notEmpty().withMessage('CVV is required')
    .isLength({ min: 3, max: 4 }).withMessage('CVV must be 3 or 4 digits')
    .isNumeric().withMessage('CVV must be numeric'),
];

/**
 * @route   POST /api/payment/process
 * @desc    Process a dummy payment (mockup)
 * @access  Protected (JWT required)
 *
 * RULES (mockup logic):
 *  - Cards starting with '0000' => FAIL (simulate decline)
 *  - Cards starting with '9999' => FAIL (simulate insufficient funds)
 *  - All other valid cards => SUCCESS
 */
router.post('/process', protect, paymentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Payment validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }

  try {
    const { amount, cardNumber, cardName, expiry, cvv, items = [] } = req.body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanCard = cardNumber.replace(/\s/g, '');
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ── Simulate card decline scenarios ──────────────────────────────────────
    if (cleanCard.startsWith('0000')) {
      return res.status(402).json({
        success: false,
        status: 'DECLINED',
        message: 'Payment declined. Your card was rejected by the issuing bank.',
        transactionId,
        errorCode: 'CARD_DECLINED',
      });
    }

    if (cleanCard.startsWith('9999')) {
      return res.status(402).json({
        success: false,
        status: 'INSUFFICIENT_FUNDS',
        message: 'Payment failed. Insufficient funds on the card.',
        transactionId,
        errorCode: 'INSUFFICIENT_FUNDS',
      });
    }

    // ── Payment Success ───────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      message: 'Payment processed successfully!',
      transactionId,
      amount: parseFloat(amount).toFixed(2),
      currency: 'USD',
      cardLast4: cleanCard.slice(-4),
      cardHolder: cardName,
      timestamp: new Date().toISOString(),
      items,
    });
  } catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ success: false, message: 'Payment processing failed. Please try again.' });
  }
});

/**
 * @route   GET /api/payment/methods
 * @desc    Get available payment methods (mockup)
 * @access  Protected
 */
router.get('/methods', protect, (req, res) => {
  res.json({
    success: true,
    methods: [
      { id: 'card', name: 'Credit / Debit Card', supported: ['Visa', 'Mastercard', 'RuPay', 'Amex'] },
      { id: 'upi', name: 'UPI', supported: ['GPay', 'PhonePe', 'Paytm'], note: 'Mockup only' },
      { id: 'cod', name: 'Cash on Delivery', supported: [], note: 'Available for orders under $500' },
    ],
  });
});

module.exports = router;
