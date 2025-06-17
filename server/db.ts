import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

const connectionString = process.env.DATABASE_URL!;
// URL encode the connection string to handle special characters
const encodedConnectionString = connectionString.replace(/!/g, '%21').replace(/#/g, '%23').replace(/&/g, '%26').replace(/%/g, '%25');
const client = postgres(encodedConnectionString);
export const db = drizzle(client, { schema });