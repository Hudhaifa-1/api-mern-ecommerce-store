import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getAllOrders, getOrderById } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/',protectRoute, adminRoute, getAllOrders)
router.get('/:id',protectRoute, adminRoute, getOrderById)

export default router;