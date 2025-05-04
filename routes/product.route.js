import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductById, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct, updateProduct } from '../controllers/product.controller.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectRoute, adminRoute , getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/category/:category', getProductsByCategory)
router.get('/recommendations', getRecommendedProducts)
router.post('/', protectRoute, adminRoute , createProduct);
router.patch('/:id', protectRoute, adminRoute , updateProduct);
router.delete('/:id', protectRoute, adminRoute , deleteProduct);
router.get('/:id', protectRoute, adminRoute , getProductById);
router.post('/toggle-featured/:id', protectRoute, adminRoute , toggleFeaturedProduct);

export default router;