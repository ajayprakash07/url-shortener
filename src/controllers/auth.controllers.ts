import { throws } from "assert";
import prisma from "../db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encode , decode } from "./converter.controllers.js";
import { Prisma } from "@prisma/client";
import type { Link } from "@prisma/client";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { isPasswordCorrect , generateAccessToken , generateRefreshToken } from "../utils/auth.js";

const generateAccessAndRefreshTokens = async(userId: number) => {
    try{
        const user: User | null = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken: string = generateAccessToken(user);
        const refreshToken: string = generateRefreshToken(userId);
        
        //Save Refresh Token in DB so we can revoke it on logout!
        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: refreshToken },
        });

        //for our reference
        return {accessToken, refreshToken};
    }catch(error){
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
};

const registerUser = asyncHandler( async(req,res) => {
    const {name , password, email , phone} = req.body;

    if([name , email, password].some((field) => field?.trim() === "")) //can also use .map or write individually
        {
        throw new ApiError(400 , "All Field are required");
    }

    if(!phone || String(phone).length!==10){
        throw new ApiError(400 , "Phone number must be 10 digits");
    }

    const existedUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone }
            ]
        }
    });

    if(existedUser){
        throw new ApiError(400 , "Email or phone already registered");
    }

    const hash: string = await bcrypt.hash(password,10);
    const user = await prisma.user.create({
        data : {
            name:name,
            email:email,
            phone:phone,
            password: hash
        }
    });

    if(!user){
        throw new ApiError(404,"Something went wrong while registring User")
    }
    const { password: _, ...createdUser } = user;
    console.log("user registered successfully");

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registration Successful")
    );
});

const loginUser = asyncHandler(async(req,res) => {
    const {email , password}=req.body;

    if([email, password].some((field) => field?.trim() === "")) 
        {
        throw new ApiError(400 , "All Field are required");
    }

    const user = await prisma.user.findUnique({
        where : {email :email}
    });

    if(!user){
        throw new ApiError(404 ,"User not found!");
    }

    const ispass = await isPasswordCorrect(password,user.password);

    if(!ispass){
        throw new ApiError(401,"Wrong Password");
    }

    const {accessToken, refreshToken }= await generateAccessAndRefreshTokens(user.id);

    const { password: _p, refreshToken: _r, ...loggedInUser } = user;

    const option ={
        httpOnly: true, 
        secure: true
    };

    console.log("SUCCESS -> LOGIN : ", user.name)
    return res
            .status(200)
            .cookie("accessToken" ,accessToken, option)
            .cookie("refreshToken",refreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,accessToken,refreshToken
                    },
                    "User logged In Successfully"
                )
        )

});

export {
    generateAccessAndRefreshTokens,
    registerUser,
    loginUser
}