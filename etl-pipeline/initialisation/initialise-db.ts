import config, { dbName } from "@/libs/config";
import pg from "@/libs/pg/client";
import { createSchema_UkCensusData } from "./_create-schema:uk-census-data";
import { dbExists, userExists } from "@/libs/pg/utils";
import { fileURLToPath } from "node:url";

export async function initialiseDb() {
  // create db if doesn't exist; create users if doesn't exist
  let client = pg("pgAdmin");
  await client.transaction(async (client) => {
    // create db on cluster
    if (!(await dbExists(client, dbName))) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
    // create user on cluster: editor
    const editorUsername = config.dbUsers.editor.username;
    if (!(await userExists(client, editorUsername))) {
      await client.query(
        `CREATE USER "${editorUsername}" WITH ENCRYPTED PASSWORD '${config.dbUsers.editor.password}'`,
      );
      console.log(`User '${editorUsername}' created.`);
    } else {
      console.log(`User '${editorUsername}' already exists.`);
    }
    // create user on cluster: reader
    const readerUsername = config.dbUsers.reader.username;
    if (!(await userExists(client, readerUsername))) {
      await client.query(
        `CREATE USER "${readerUsername}" WITH ENCRYPTED PASSWORD '${config.dbUsers.reader.password}'`,
      );
      console.log(`User '${readerUsername}' created.`);
    } else {
      console.log(`User '${readerUsername}' already exists.`);
    }
  });
  await client.close();

  // initialise the database
  client = pg("pgAdmin", dbName);
  await client.transaction(async (client) => {
    // create schemas (and table therein)
    const schemas = [await createSchema_UkCensusData(client)];
    // grant permissions to editor
    const editorUsername = config.dbUsers.editor.username;
    await client.query(
      `GRANT CONNECT ON DATABASE "${dbName}" TO "${editorUsername}"`,
    );
    for (const schemaName of schemas) {
      await client.query(`
              GRANT USAGE ON SCHEMA "${schemaName}" TO "${editorUsername}";
              GRANT MAINTAIN, SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "${schemaName}" TO "${editorUsername}";
          `);
    }
    // grant permissions to reader
    const readerUsername = config.dbUsers.reader.username;
    await client.query(
      `GRANT CONNECT ON DATABASE "${dbName}" TO "${readerUsername}"`,
    );
    for (const schemaName of schemas) {
      await client.query(`
              GRANT USAGE ON SCHEMA "${schemaName}" TO "${readerUsername}";
              GRANT SELECT ON ALL TABLES IN SCHEMA "${schemaName}" TO "${readerUsername}"
          `);
    }
  });
  await client.close();

  console.log("Done!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await initialiseDb();
}
