import "dotenv/config";
import { prisma , clientRedis} from "./db.js";
import { app } from "./index.js"; 

const PORT = process.env.PORT || 8000;


clientRedis.on("connect", () => console.log("✅ Redis connected"));
clientRedis.on("error", (err) => console.error("❌ Redis error:", err));

async function startServer() {
    try {
        //Check PostgreSQL
        await prisma.$connect();
        console.log("✅ PostgreSQL connected via Prisma");
        //Check Redis
        await clientRedis.ping();
        console.log("✅ Redis ping successful");
        //Start Express
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port: ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Startup failed ->", error);
        process.exit(1);
    }
}
startServer();
