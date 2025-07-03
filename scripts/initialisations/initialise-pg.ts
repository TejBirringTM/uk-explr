import config, { dbName } from "@/libs/config";
import pg from "@/libs/pg";
import { dbExists, userExists } from "../helpers/pg";
import { type PoolClient } from "pg";

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
  // create 'highest-qualifications' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."highest-qualifications" (
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
  // create 'occupations' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."occupations" (
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
  // create 'housing-tenures' table
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."housing-tenures" (
     "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
     "all_households" integer NOT NULL CHECK("all_households" >= 0),
     "owned" integer NOT NULL CHECK("owned" = "owned_outright" + "owned_w_mortgage_or_loan" and "owned" >= 0),
     "owned_outright" integer NOT NULL CHECK("owned_outright" >= 0),
     "owned_w_mortgage_or_loan" integer NOT NULL CHECK("owned_w_mortgage_or_loan" >= 0),
     "shared_ownership" integer NOT NULL CHECK("shared_ownership" >= 0),
     "social_rented" integer NOT NULL CHECK("social_rented" = "social_rented_from_local_authority" + "social_rented_from_other" and "social_rented" >= 0),
     "social_rented_from_local_authority" integer NOT NULL CHECK("social_rented_from_local_authority" >= 0),
     "social_rented_from_other" integer NOT NULL CHECK("social_rented_from_other" >= 0),
     "private_rented" integer NOT NULL CHECK("private_rented" = "private_rented_from_landlord_or_letting_agency" + "private_rented_from_other" and "private_rented" >= 0),
     "private_rented_from_landlord_or_letting_agency" integer NOT NULL CHECK("private_rented_from_landlord_or_letting_agency" >= 0),
     "private_rented_from_other" integer NOT NULL CHECK("private_rented_from_other" >= 0),
     "lives_rent_free" integer NOT NULL CHECK("lives_rent_free" >= 0)
  )`);
  // create 'economic-activity-status' table, TO DO: improve checks with summation
  await client.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."economic-activity-statuses" (
    "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age" >= 0),

    "active_not_ft_student" integer NOT NULL CHECK ("active_not_ft_student" >= 0),
    "active_not_ft_student:unemployed" integer NOT NULL CHECK ("active_not_ft_student:unemployed" >= 0),

    "active_not_ft_student:employed" integer NOT NULL CHECK ("active_not_ft_student:employed" >= 0),

    "active_not_ft_student:employed:employee" integer NOT NULL CHECK ("active_not_ft_student:employed:employee" >= 0),
    "active_not_ft_student:employed:employee:ft" integer NOT NULL CHECK ("active_not_ft_student:employed:employee:ft" >= 0),
    "active_not_ft_student:employed:employee:pt" integer NOT NULL CHECK ("active_not_ft_student:employed:employee:pt" >= 0),

    "active_not_ft_student:employed:self_employed_no_employees" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_no_employees" >= 0),
    "active_not_ft_student:employed:self_employed_no_employees:ft" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_no_employees:ft" >= 0),
    "active_not_ft_student:employed:self_employed_no_employees:pt" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_no_employees:pt" >= 0),

    "active_not_ft_student:employed:self_employed_w_employees" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_w_employees" >= 0),
    "active_not_ft_student:employed:self_employed_w_employees:ft" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_w_employees:ft" >= 0),
    "active_not_ft_student:employed:self_employed_w_employees:pt" integer NOT NULL CHECK ("active_not_ft_student:employed:self_employed_w_employees:pt" >= 0),

    "active_ft_student" integer NOT NULL CHECK ("active_ft_student" >= 0),

    "active_ft_student:unemployed" integer NOT NULL CHECK ("active_ft_student:unemployed" >= 0),

    "active_ft_student:employed" integer NOT NULL CHECK ("active_ft_student:employed" >= 0),

    "active_ft_student:employed:employee" integer NOT NULL CHECK ("active_ft_student:employed:employee" >= 0),
    "active_ft_student:employed:employee:ft" integer NOT NULL CHECK ("active_ft_student:employed:employee:ft" >= 0),
    "active_ft_student:employed:employee:pt" integer NOT NULL CHECK ("active_ft_student:employed:employee:pt" >= 0),

    "active_ft_student:employed:self_employed_no_employees" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_no_employees" >= 0),
    "active_ft_student:employed:self_employed_no_employees:ft" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_no_employees:ft" >= 0),
    "active_ft_student:employed:self_employed_no_employees:pt" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_no_employees:pt" >= 0),

    "active_ft_student:employed:self_employed_w_employees" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_w_employees" >= 0),
    "active_ft_student:employed:self_employed_w_employees:ft" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_w_employees:ft" >= 0),
    "active_ft_student:employed:self_employed_w_employees:pt" integer NOT NULL CHECK ("active_ft_student:employed:self_employed_w_employees:pt" >= 0),

    "inactive" integer NOT NULL CHECK ("inactive" >= 0),
    "inactive:retired" integer NOT NULL CHECK ("inactive:retired" >= 0),
    "inactive:student" integer NOT NULL CHECK ("inactive:student" >= 0),
    "inactive:looking_after_home_or_family" integer NOT NULL CHECK ("inactive:looking_after_home_or_family" >= 0),
    "inactive:long_term_sickness_or_disabled" integer NOT NULL CHECK ("inactive:long_term_sickness_or_disabled" >= 0),
    "inactive:other" integer NOT NULL CHECK ("inactive:other" >= 0)
  )`);
  return schemaName;
}
