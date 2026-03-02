const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', validateOrder, orderController.createOrder);
router.patch('/:id', orderController.updateOrderStatus);

module.exports = router;
