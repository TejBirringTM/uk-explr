import { dbName } from "@/libs/config";
import pg from "@/libs/pg/client";
import { fileURLToPath } from "node:url";

export async function clearDb() {
  let client = pg("pgAdmin");
  await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  await client.close();

  console.log("Done!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await clearDb();
}
