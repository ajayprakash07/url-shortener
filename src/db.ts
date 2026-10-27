import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Redis } from "ioredis"

// 1. Initialize the Postgres adapter with your cloud DB URL
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

//redis 
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}
const clientRedis = new Redis(redisUrl);

export {
  clientRedis,
  prisma
}
