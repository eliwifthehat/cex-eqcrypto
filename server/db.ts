import { drizzle } from "drizzle-orm/postgres-js";
import { createOptimizedConnection, QueryOptimizer } from "./db-optimization";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = createOptimizedConnection(connectionString);
export const db = drizzle(client, { schema });

// Create query optimizer instance
export const queryOptimizer = new QueryOptimizer(client);

// Export for use in other modules
export { queryOptimizer as dbOptimizer };