import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
    async login(req: Request, res: Response) {
        const { npk, password } = req.body;
        try {
            const authService = new AuthService();
            const result = await authService.login(npk, password);
            res.json(result);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error?.message || "Login failed" });
        }
    }
}