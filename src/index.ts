import express from "express";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-app-pin"]

}));

app.use(express.json({limit: "128kb"})); 

app.use(express.urlencoded({extended: true, limit: "16kb"})); 

app.use(express.static("public"));

app.use("/short/")

export { app };