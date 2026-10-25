import "dotenv/config";
import prisma from "./db.js";
import { app } from "./index.js"; 

const PORT = process.env.PORT || 8000;

console.log("Establishing Connection...");

prisma.$connect()
    .then(() => {
        console.log("✅ PostgreSQL connected via Prisma");
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection failed ->", error);
        process.exit(1);
    });