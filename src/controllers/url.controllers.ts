import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encode , decode } from "./converter.controllers.js";
//import { db } from "./prisma/db";

const createLink = asyncHandler(async(req,res) => {
    const url:string = req.body;

    if(!url || url.trim()===""){
        return new ApiError(400,"URL cannot be empty");
    }


});