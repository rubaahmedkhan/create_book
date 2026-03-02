import { pool } from "../src/lib/db";

async function checkSchema() {
  try {
    console.log("Checking session table schema...\n");

    // Get column information
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'session'
      ORDER BY ordinal_position
    `);

    console.log("Session table columns:");
    result.rows.forEach((col) => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log("\nChecking a sample session:");
    const sampleResult = await pool.query(`
      SELECT *
      FROM session
      LIMIT 1
    `);

    if (sampleResult.rows.length > 0) {
      console.log("\nSample session data:");
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();
