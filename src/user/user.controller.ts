import type { Request, Response } from "express";
import { UserService } from "./user.service.js";

const userService = new UserService();

export class UserController {
    async getUserByNpk(req: Request, res: Response) {
        const npk = req.params.npk;
        if (!npk) {
            return res.status(400).json({ error: "NPK is required" });
        }

        try {
            const user = await userService.findUserByNpk(npk);
            res.json(user);
        } catch (error: any) {
            console.error(error);
            res.status(404).json({ error: error?.message || "User not found" });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.findAllUsers();
            res.json(users);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error?.message || "Failed to retrieve users" });
        }
    }

    async createUser(req: Request, res: Response) {
        const { npk, name, password, section, position, grade, departmentId } = req.body;

        if (!npk || !name || !password || !section || !position || grade === undefined || departmentId === undefined) {
            return res.status(400).json({ error: "All fields are required" });
        }

        try {
            const newUser = await userService.createUser(npk, name, password, section, position, grade, departmentId);
            res.status(201).json(newUser);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error?.message || "Failed to create user" });
        }
    }

    async updateUser(req: Request, res: Response) {
        const npk = req.params.npk;
        const allowedFields = ["name", "password", "section", "position", "grade", "departmentId"];
        const updateData: any = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        if (!npk) {
            return res.status(400).json({ error: "NPK is required" });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        try {
            const updatedUser = await userService.updateUser(npk, updateData);
            res.json(updatedUser);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error?.message || "Failed to update user" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const npk = req.params.npk;
        if (!npk) {
            return res.status(400).json({ error: "NPK is required" });
        }
        try {
            await userService.deleteUser(npk);
            res.status(204).send();
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error?.message || "Failed to delete user" });
        }
    }

    async updateUserPrivillege(req: Request, res: Response) {
        const npk = req.params.npk;
        const { privillege } = req.body;

        if (!npk || !privillege) {
            return res.status(400).json({ error: "NPK and privillege are required" });
        }

        if (!['ADMIN', 'HRD', 'PCDA', 'USER'].includes(privillege)) {
            return res.status(400).json({ error: "Invalid privillege value" });
        }

        try {
            const updatedUser = await userService.updatePrivillege(npk, privillege);
            res.json(updatedUser);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error?.message || "Failed to update user privillege" });
        }
    }
}