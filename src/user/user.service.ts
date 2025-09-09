import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
    async findUserByNpk(npk: string) {
        const user = prisma.user.findUnique({ where: { npk } });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async findAllUsers() {
        return prisma.user.findMany();
    }

    async createUser(npk: string, name: string, password: string, section: string, position: string, grade: number, departmentId: number) {
        if (await prisma.user.findUnique({ where: { npk } })) {
            throw new Error('User already exists');
        }

        if (!await prisma.department.findUnique({ where: { department_id: departmentId } })) {
            throw new Error('Department not found');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return prisma.user.create({
            data: {
                npk,
                name,
                password: hashedPassword,
                section,
                position,
                grade,
                departmentId
            }
        });
    }

    async updateUser(npk: string, updateData: { name?: string; password?: string; section?: string; position?: string; grade?: number; departmentId?: number }) {
        const user = await prisma.user.findUnique({ where: { npk } });
        if (!user) {
            throw new Error('User not found');
        }

        if (updateData.departmentId !== undefined) {
            if (!await prisma.department.findUnique({ where: { department_id: updateData.departmentId } })) {
                throw new Error('Department not found');
            }
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        return prisma.user.update({
            where: { npk },
            data: updateData
        });
    }

    async deleteUser(npk: string) {
        const user = await prisma.user.findUnique({ where: { npk } });
        if (!user) {
            throw new Error('User not found');
        }
        return prisma.user.delete({ where: { npk } });
    }

    async updatePrivillege(npk: string, privillege: 'ADMIN' | 'OPERATION' | 'USER') {
        const user = await prisma.user.findUnique({ where: { npk } });
        if (!user) {
            throw new Error('User not found');
        }

        return prisma.user.update({
            where: { npk },
            data: { privillege }
        });
    }
}