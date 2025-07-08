import { dbName } from "@/libs/config";
import pg from "@/libs/pg-client";

let client = pg("pgAdmin");
await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
await client.close();

console.log("Done!");
