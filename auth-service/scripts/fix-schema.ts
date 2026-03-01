import { pool } from "../src/lib/db";

const fixSchemaSQL = `
-- Fix the account table schema to allow NULL provider for email/password auth
ALTER TABLE "account" ALTER COLUMN "provider" DROP NOT NULL;

-- Also make providerId nullable for flexibility
ALTER TABLE "account" ALTER COLUMN "providerId" DROP NOT NULL;
`;

async function fixSchema() {
  try {
    console.log("Fixing account table schema...");

    await pool.query(fixSchemaSQL);

    console.log("✅ Schema fixed successfully!");
    console.log("  - provider column now allows NULL");
    console.log("  - providerId column now allows NULL");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fix schema:", error);
    await pool.end();
    process.exit(1);
  }
}

fixSchema();
