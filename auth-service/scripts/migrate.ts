import { auth } from "../src/auth";
import { toSql } from "better-auth";
import { pool } from "../src/lib/db";

async function migrate() {
  try {
    console.log("Generating migration SQL...");

    // Get migration SQL from Better Auth
    const migration = await toSql({
      auth,
      adapter: "postgresql",
    });

    console.log("Migration SQL:");
    console.log(migration);

    console.log("\nExecuting migration...");

    // Execute the migration
    await pool.query(migration);

    console.log("✅ Migration completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
