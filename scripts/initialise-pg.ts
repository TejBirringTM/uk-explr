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
  const schemas = [await createSchema_UkCensusData(client)];
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

async function createSchema_UkCensusData(client: PoolClient) {
  const schemaName = "uk-census-data";
  // create the schema
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  // create 'output-areas' identity table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."output-areas" (
        "id" varchar(250) PRIMARY KEY GENERATED ALWAYS AS ("oa_code" || '@' || "year") STORED,
        
        "oa_code" varchar(250) NOT NULL,
        "year" integer NOT NULL CHECK ("year" > 0),

        "lsoa_code" varchar(250) NOT NULL,
        "msoa_code" varchar(250) NOT NULL,
        
        "oa_name" varchar(250),
        "lsoa_name" varchar(250) NOT NULL,
        "msoa_name" varchar(250) NOT NULL
    )`);
  // create 'highest-qualification' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."highest-qualification" (
    "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age" >= 0),
    "no_qualification" integer NOT NULL CHECK ("no_qualification" >= 0),
    "level_1" integer NOT NULL CHECK ("level_1" >= 0),
    "level_2" integer NOT NULL CHECK ("level_2" >= 0),
    "apprenticeship" integer NOT NULL CHECK ("apprenticeship" >= 0),
    "level_3" integer NOT NULL CHECK ("level_3" >= 0),
    "gte_level_4" integer NOT NULL CHECK ("gte_level_4" >= 0),
    "other" integer NOT NULL CHECK ("other" >= 0)
  )`);
  // create 'postal-codes' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."postal-codes" (
    "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
    "postal_code" varchar(25) NOT NULL,
    "source" varchar(250) NOT NULL
  )`);
  // create 'occupation' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."occupation" (
    "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age_in_employment_week_before_census" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age_in_employment_week_before_census" >= 0),
    "managers_and_directors_and_senior_officials" integer NOT NULL CHECK ("managers_and_directors_and_senior_officials" >= 0),
    "professional_occupations" integer NOT NULL CHECK ("professional_occupations" >= 0),
    "associate_professional_and_technical_occupations" integer NOT NULL CHECK ("associate_professional_and_technical_occupations" >= 0),
    "administrative_and_secretarial_occupations" integer NOT NULL CHECK ("administrative_and_secretarial_occupations" >= 0),
    "skilled_trades_occupations" integer NOT NULL CHECK ("skilled_trades_occupations" >= 0),
    "caring_and_leisure_and_other_service_occupations" integer NOT NULL CHECK ("caring_and_leisure_and_other_service_occupations" >= 0),
    "sales_and_customer_service_occupations" integer NOT NULL CHECK ("sales_and_customer_service_occupations" >= 0),
    "process_and_plant_and_machine_operatives" integer NOT NULL CHECK ("process_and_plant_and_machine_operatives" >= 0),
    "elementary_occupations" integer NOT NULL CHECK ("elementary_occupations" >= 0)
  )`);
  return schemaName;
}
