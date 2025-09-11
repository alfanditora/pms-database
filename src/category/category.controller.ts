import { categoryService, type categoryInput, type updateCategoryInput } from "./category.service.js";
import type { Request, Response, NextFunction } from 'express';

const catService = new categoryService();

export class categoryController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await catService.findAll();
            res.status(200).json(categories);
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
            const category = await catService.findById(id);
            res.status(200).json(category);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data: categoryInput = req.body;
            // Basic validation
            if (!data.name || data.routine == null || data.non_routine == null || data.project == null) {
                return res.status(400).json({ message: 'Missing required fields: name, routine, non_routine, project' });
            }
            const newCategory = await catService.createCategory(data);
            res.status(201).json(newCategory);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const paramsid = req.params.id;
            if (!paramsid) {
                return res.status(400).json({ message: 'ID is empty' });
            }
            const id = parseInt(paramsid, 10);
            const data: updateCategoryInput = req.body;

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID format' });
            }
            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: 'Request body cannot be empty' });
            }

            const updatedCategory = await catService.updateCategory(id, data);
            res.status(200).json(updatedCategory);
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
            await catService.deleteCategory(id);
            res.status(200).json({ message: `Category with ID '${id}' deleted successfully` });
        } catch (error) {
            next(error);
        }
    }
}