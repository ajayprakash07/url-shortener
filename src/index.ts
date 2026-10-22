import express from "express";
import cors from 'cors';
import controlRoute from "./routes/control.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-app-pin"]

}));

app.use(express.json({limit: "128kb"})); 

app.use(express.urlencoded({extended: true, limit: "16kb"})); 

app.use(express.static("public"));


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API Server is live and healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/logRouter/v1",controlRoute)
export { app };