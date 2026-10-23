import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";

export const isPasswordCorrect = async (plainPassword: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hash);
};

export const generateAccessToken = (user: Pick<User, "id" | "email">): string => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );
};

export const generateRefreshToken = (userId: number): string => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );
};