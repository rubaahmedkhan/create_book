import { pool } from "../src/lib/db";

async function checkSessions() {
  try {
    console.log("Checking sessions in database...\n");

    const result = await pool.query(`
      SELECT id, "userId", token, "expiresAt", "createdAt"
      FROM session
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);

    console.log(`Found ${result.rows.length} sessions:\n`);

    result.rows.forEach((session, index) => {
      console.log(`Session ${index + 1}:`);
      console.log(`  ID: ${session.id}`);
      console.log(`  User ID: ${session.userId}`);
      console.log(`  Token: ${session.token}`);
      console.log(`  Expires At: ${session.expiresAt}`);
      console.log(`  Created At: ${session.createdAt}`);
      console.log();
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
    process.exit(1);
  }
}

checkSessions();
