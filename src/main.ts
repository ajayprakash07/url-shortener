import "dotenv/config";
import { prisma , redis} from "./db.js";
import { app } from "./index.js"; 

const PORT = process.env.PORT || 8000;


async function startServer() {
    try {
        //PostgreSQL connection
        await prisma.$connect();
        console.log("✅ PostgreSQL connected via Prisma");
        
        //redis http connection 
        const pong = await redis.ping();
        console.log("✅ Upstash Redis connected:", pong); 
        
        //start express
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port: ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Startup failed ->", error);
        process.exit(1);
    }
}

startServer();
