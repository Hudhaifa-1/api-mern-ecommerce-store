import express from 'express'
import { createCategory, getAllCategories, getCategoryById, getCategoryList, updateCategory } from '../controllers/category.controller.js';
import {protectRoute, adminRoute} from '../middleware/auth.middleware.js'

const router = express.Router();


router.get("/list", protectRoute, adminRoute, getCategoryList)
router.get("/", getAllCategories)
router.post("/", protectRoute, adminRoute, createCategory)
router.get("/:id", protectRoute, adminRoute, getCategoryById)
router.patch("/:id", protectRoute, adminRoute, updateCategory)

export default router;