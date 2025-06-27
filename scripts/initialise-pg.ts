import "../libs/load-env";
import config, { dbName } from "../libs/config";
import pg from "../libs/pg";
import { dbExists, userExists } from "./helpers/pg";
import { PoolClient } from "pg";

// create db if doesn't exist; create users if doesn't exist
let client = pg("pgAdmin");
await client.transaction(async (client) => {
  // create db on cluster
  if (!(await dbExists(client, dbName))) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.debug(console.debug(`Database '${dbName}' created.`));
  } else {
    console.debug(console.debug(`Database '${dbName}' already exists.`));
  }
  // create user on cluster: editor
  const editorUsername = config.dbUsers.editor.username;
  if (!(await userExists(client, editorUsername))) {
    await client.query(
      `CREATE USER "${editorUsername}" WITH ENCRYPTED PASSWORD '${config.dbUsers.editor.password}'`,
    );
    console.debug(`User '${editorUsername}' created.`);
  } else {
    console.debug(`User '${editorUsername}' already exists.`);
  }
  // create user on cluster: reader
  const readerUsername = config.dbUsers.reader.username;
  if (!(await userExists(client, readerUsername))) {
    await client.query(
      `CREATE USER "${readerUsername}" WITH ENCRYPTED PASSWORD '${config.dbUsers.reader.password}'`,
    );
    console.debug(`User '${readerUsername}' created.`);
  } else {
    console.debug(`User '${readerUsername}' already exists.`);
  }
});
await client.close();

// initialise the database
client = pg("pgAdmin", dbName);
await client.transaction(async (client) => {
  // create schemas (and table therein)
  const schemas = [await createSchema_UKCensusData(client)];
  // grant permissions to editor
  const editorUsername = config.dbUsers.editor.username;
  await client.query(
    `GRANT CONNECT ON DATABASE "${dbName}" TO "${editorUsername}"`,
  );
  for (const schemaName of schemas) {
    await client.query(`
            GRANT USAGE ON SCHEMA "${schemaName}" TO "${editorUsername}";
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "${schemaName}" TO "${editorUsername}";
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

async function createSchema_UKCensusData(client: PoolClient) {
  const schemaName = "uk-census-data";
  // create the schema
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  // create 'output-areas' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."output-areas" (
        "id" varchar(250) PRIMARY KEY GENERATED ALWAYS AS ("oa_code" || '@' || "year") STORED,
        
        "oa_code" varchar(250) NOT NULL,
        "year" integer NOT NULL CHECK (year > 0),

        "lsoa_code" varchar(250) NOT NULL,
        "msoa_code" varchar(250) NOT NULL,
        
        "oa_name" varchar(250),
        "lsoa_name" varchar(250) NOT NULL,
        "msoa_name" varchar(250) NOT NULL
    )`);
  return schemaName;
}
