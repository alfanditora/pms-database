import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type categoryInput = {
    name: string;
    routine: number;
    non_routine: number;
    project: number;
}

export type updateCategoryInput = Partial<categoryInput>;

export class categoryService {
    async findAll() {
        return prisma.category.findMany();
    }

    async findById(id: number) {
        const existingCategory = await prisma.category.findUnique({
            where: { category_id: id }
        });

        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        return existingCategory;
    }

    async createCategory(data: categoryInput) {
        return prisma.category.create({ data });
    }

    async updateCategory(id: number, updateData: updateCategoryInput) {
        const existingCategory = await prisma.category.findUnique({ where: { category_id: id } });
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        
        return prisma.category.update({
            where: { category_id: id },
            data: updateData
        });
    }

    async deleteCategory(id: number) {
        const existingCategory = await prisma.category.findUnique({ where: { category_id: id } });
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }
        return prisma.category.delete({ where: { category_id: id } });
    }
}
