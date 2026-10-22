import { throws } from "assert";
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

    if(!url || typeof url !== "string" || url.trim()===""){
        throw new ApiError(400,"URL cannot be empty");
    }

    const upload: Link | null = await prisma.link.create({
        data: {
            url: url
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

    console.log(shortCode);
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

    console.log(url.url)

    return res.status(200).json(
        new ApiResponse(200,url,"URL successfully Fetched")
    );
});

export {
    createLink,
    directURL
}