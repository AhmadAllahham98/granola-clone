import 'dotenv/config'; // Ensure process.env is populated
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const { Pool } = pg;

// Initialize and export the Prisma client singleton
// This will connect to the DATABASE_URL defined in your .env
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma = new PrismaClient({ adapter });
