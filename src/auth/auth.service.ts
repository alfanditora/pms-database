import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in your .env file");
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
    async login(npk: string, password: string) {
        const user = await prisma.user.findUnique({ where: { npk } });
        if (!user) {
            throw new Error('User not found');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ npk: user.npk, privillege: user.privillege }, JWT_SECRET as string, { expiresIn: '1d' });
        return { user, token };
    }
}