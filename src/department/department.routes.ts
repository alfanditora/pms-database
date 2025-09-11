import express from 'express';
import { departmentController } from './department.controller.js';
import { adminMiddleware, authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const deptController = new departmentController();

router.get('/all', authMiddleware, deptController.getAll);
router.get('/find/:id', authMiddleware, deptController.getById);
router.post('/create', authMiddleware, adminMiddleware, deptController.create);
router.put('/update/:id', authMiddleware, adminMiddleware, deptController.update);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deptController.delete);

export default router;