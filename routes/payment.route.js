import express from 'express';
import {protectRoute } from '../middleware/auth.middleware.js';
import {prepareOrderForPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/', protectRoute, prepareOrderForPayment)

export default router;