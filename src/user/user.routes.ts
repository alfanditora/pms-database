import express from 'express';
import { UserController } from './user.controller.js';
import { adminMiddleware, authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const userController = new UserController();

router.get('/:npk', authMiddleware, userController.getUserByNpk.bind(userController));
router.get('/all', authMiddleware, userController.getAllUsers.bind(userController));
router.post('/create', authMiddleware, adminMiddleware, userController.createUser.bind(userController));
router.put('/:npk', authMiddleware, userController.updateUser.bind(userController));
router.delete('/:npk', authMiddleware, adminMiddleware, userController.deleteUser.bind(userController));
router.put('/:npk/privillege', authMiddleware, adminMiddleware, userController.updateUserPrivillege.bind(userController));

export default router;