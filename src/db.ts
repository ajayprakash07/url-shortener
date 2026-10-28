import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Redis } from '@upstash/redis'

// 1. Initialize the Postgres adapter with your cloud DB URL
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

//redis 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export {
  redis,
  prisma
}
