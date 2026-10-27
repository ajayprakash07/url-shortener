import { throws } from "assert";
import "dotenv/config";
import prisma from "../db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encode , decode } from "./converter.controllers.js";
import { Prisma } from "@prisma/client";
import type { Link } from "@prisma/client";
import { ApiResponse } from "../utils/ApiResponse.js";

const offset:number = 15000000;

const createLink = asyncHandler(async(req,res) => {
    const {url} = req.body;
    const {id}  = (req as any).user;
    
    if(!url || typeof url !== "string" || url.trim()===""){
        throw new ApiError(400,"URL cannot be empty");
    }

    if(!id){
        throw new ApiError(400,"User id is required");
    }

    const count = await prisma.link.count({
        where: {
            userId: id
        }
    });

    if(count>Number(process.env.LINK_LIMIT)){
        throw new ApiError(403,"Link creation Limit reached (Max 10)");
    }

    const upload: Link | null = await prisma.link.create({
        data: {
            url: url,
            userId: id
        }
    });

    if(!upload.id){
        throw new ApiError(404,"Something went wrong while creating");
    }

    const offID: number = offset+upload.id;

    const shortCode : string = encode(offID);

    if(!shortCode || shortCode.trim()===""){
        throw new ApiError(408,"Short URL did not process");
    }

    return res.status(201).json(
        new ApiResponse(201,shortCode, "Short URL Successfully Created")
    );
});

const directURL = asyncHandler(async(req,res) => {
    const {code} = req.params;

    if(!code || typeof code!="string" || code.trim()===""){
        throw new ApiError(400,"Invalid short URL");
    }

    const index:number = decode(code);

    console.log(index);
    if(!index || index<offset){
        throw new ApiError(400,"Bad Request ,Invalid index.");
    }

    const url: Link | null = await prisma.link.findUnique({
        where : { id:index-offset }
    })

    if(!url){
        throw new ApiError(404,"Something went wrong while fetching");
    }

    await prisma.link.update({
        where: {id : index-offset},
        data: { visit: { increment: 1 }}
    })

    return res.status(200).json(
        new ApiResponse(200,url,"URL successfully Fetched")
    );
});

const deleteURL = asyncHandler(async(req,res) => {
    const {id}  =req.params;

    if(!id){
        throw new ApiError(400,"Link id missing");
    }

    const del = await prisma.link.delete({
        where: {id:Number(id)}
    });

    if(!del){
        throw new ApiError(401,"Unable to delete");
    }

    console.log("Link deleted");
    return res.status(201).json(
        new ApiResponse(200,del,"Successfully Deleted")
    );
});

const fetchUser = asyncHandler(async(req,res) => {
    const {id}  = (req as any).user;

    if(!id){
        throw new ApiError(400,"Unauthotized Access");
    }

    const detail = await prisma.link.findMany({
        where: {userId:id}
    });

    if(!detail){
        throw new ApiError(404,"Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200,detail,"Details fetched Successfully")
    );
});

export {
    createLink,
    directURL,
    deleteURL,
    fetchUser
}