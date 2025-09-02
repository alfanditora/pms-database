import express from 'express';
import { AuthController } from './auth.controller.js';

const router = express.Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));

export default router;