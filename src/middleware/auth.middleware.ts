import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import "dotenv/config";
import {prisma} from "../db.js";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@prisma/client";

export interface AuthRequest extends Request {
    user?: any;
}

const verifyJWT = asyncHandler(async(req: AuthRequest,_:Response,next:NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: number; email: string };
        
        const user = await prisma.user.findUnique({ where : {id: decodedToken.id} , select: {
        id: true,
        name: true,
        email: true,
        phone: true
    }});

        if(!user){
            throw new ApiError(401, "Invalid Access Token for user")
        }

        req.user = user;
        next()
    } catch (error) {
        console.log("verifyJWT ERROR ->", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(401, (error as Error)?.message || "Invalid Access Token");
    }
});

export {
    verifyJWT
}