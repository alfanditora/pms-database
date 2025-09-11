import express from "express";
import { categoryController } from "./category.controller.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
const category = new categoryController();

router.get('/all', authMiddleware, category.getAll);
router.get('/find/:id', authMiddleware, category.getById);
router.post('/create', authMiddleware, adminMiddleware, category.create);
router.put('/update/:id', authMiddleware, adminMiddleware, category.update);
router.delete('/delete/:id', authMiddleware, adminMiddleware, category.delete);

export default router;