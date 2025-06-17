import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
// URL encode the connection string to handle special characters
const encodedConnectionString = connectionString.replace(/!/g, '%21').replace(/#/g, '%23').replace(/&/g, '%26').replace(/%/g, '%25');
const client = postgres(encodedConnectionString, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "migrations" });
  console.log("Migrations completed!");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});