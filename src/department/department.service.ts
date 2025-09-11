import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class departmentService {
    async findAll() {
        return prisma.department.findMany();
    }

    async findById(id: number) {
        const existingDept = await prisma.department.findUnique({ where: { department_id: id } });
        if (!existingDept) {
            throw new Error(`Department with ID '${id}' not found`);
        }
        return existingDept;
    }

    async createDept(name: string) {
        return prisma.department.create( { data: {
            name
        } });
    }

    async updateDept(id: number, name: string) {
        const existingDept = await prisma.department.findUnique({ where: { department_id: id } });
        if (!existingDept) {
            throw new Error(`Department with ID '${id}' not found`);
        }
        return prisma.department.update( { 
            where: { department_id: id },
            data: { name } 
        });
    }

    async deleteDept(id: number) {
        const existingDept = await prisma.department.findUnique({ where: { department_id: id } });
        if (!existingDept) {
            throw new Error(`Department with ID '${id}' not found`);
        }

        return prisma.department.delete({
            where: {  department_id: id }
        });
    }
}