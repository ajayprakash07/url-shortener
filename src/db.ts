import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Initialize the Postgres adapter with your cloud DB URL
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

export default prisma;