import { departmentService } from "./department.service.js";
import type { Request, Response, NextFunction } from 'express';

const deptService = new departmentService();

export class departmentController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const departments = await deptService.findAll();
            res.status(200).json(departments);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const paramsid = req.params.id;
            if (!paramsid) {
                return res.status(400).json({ message: 'ID is empty' });
            }
            const id = parseInt(paramsid, 10);
            if (isNaN(id)) {
                 return res.status(400).json({ message: 'Invalid ID format' });
            }
            const dept = await deptService.findById(id);
            res.status(200).json(dept);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }
            const newDept = await deptService.createDept(name);
            res.status(201).json(newDept);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const paramsid = req.params.id;
            const { name } = req.body;

            if (!paramsid) {
                return res.status(400).json({ message: 'ID is empty' });
            }
            const id = parseInt(paramsid, 10);
            if (isNaN(id)) {
                 return res.status(400).json({ message: 'Invalid ID format' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }

            const updatedDept = await deptService.updateDept(id, name);
            res.status(200).json(updatedDept);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const paramsid = req.params.id;
            if (!paramsid) {
                return res.status(400).json({ message: 'ID is empty' });
            }
            const id = parseInt(paramsid, 10);
            if (isNaN(id)) {
                 return res.status(400).json({ message: 'Invalid ID format' });
            }
            await deptService.deleteDept(id);
            res.status(200).json({ message: `Department with ID '${id}' deleted successfully` });
        } catch (error) {
            next(error);
        }
    }
}
