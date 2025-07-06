import type { PoolClient } from "pg";

export async function createSchema_UkCensusData(client: PoolClient) {
  const schemaName = "uk-census-data";
  // create the schema
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  // create types
  await client.query(`CREATE TYPE "month" AS ENUM(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
  )`);
  await client.query(`
    CREATE OR REPLACE FUNCTION "enum_to_text"(val ANYELEMENT)
    RETURNS TEXT AS $$
    BEGIN
        RETURN val::TEXT;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `);
  // create 'output-areas' identity table
  await client.query(`CREATE TABLE "${schemaName}"."output-areas" (
    "id" varchar(250) PRIMARY KEY GENERATED ALWAYS AS ("oa_code" || '@' || "oa_year") STORED,

    "oa_code" varchar(250) NOT NULL,
    "oa_year" integer NOT NULL CHECK ("oa_year" > 0),

    "lsoa_code" varchar(250) NOT NULL,
    "msoa_code" varchar(250) NOT NULL,

    "oa_name" varchar(250),
    "lsoa_name" varchar(250) NOT NULL,
    "msoa_name" varchar(250) NOT NULL,

    "lad_code"  varchar(250) NOT NULL,
    "lad_year" integer NOT NULL CHECK ("lad_year" > 0),
    "lad_name"  varchar(250) NOT NULL
  )`);
  // create 'highest-qualifications' table
  await client.query(`CREATE TABLE "${schemaName}"."highest-qualifications" (
    "id" varchar(250) PRIMARY KEY REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age" >= 0),
    "none" integer NOT NULL CHECK ("none" >= 0),
    "level_1" integer NOT NULL CHECK ("level_1" >= 0),
    "level_2" integer NOT NULL CHECK ("level_2" >= 0),
    "apprenticeship" integer NOT NULL CHECK ("apprenticeship" >= 0),
    "level_3" integer NOT NULL CHECK ("level_3" >= 0),
    "gte_level_4" integer NOT NULL CHECK ("gte_level_4" >= 0),
    "other" integer NOT NULL CHECK ("other" >= 0)
  )`);
  // create 'postal-codes' table
  await client.query(`CREATE TABLE "${schemaName}"."postal-codes" (
    "id" varchar(250) REFERENCES "${schemaName}"."output-areas"("id"),
    "postal_code" varchar(25) NOT NULL,
    "month" month NOT NULL,
    "year" integer NOT NULL CHECK ("year" > 0),
    "source" varchar(250) GENERATED ALWAYS AS (enum_to_text("month") || ' ' || "year") STORED
  )`);
  await client.query(
    `CREATE INDEX "idx-postal-codes-by-oa" ON "${schemaName}"."postal-codes" USING HASH ("id")`,
  );
  // create 'occupations' table
  await client.query(`CREATE TABLE "${schemaName}"."occupations" (
    "id" varchar(250) PRIMARY KEY REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age_in_employment" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age_in_employment" >= 0),
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
  await client.query(`CREATE TABLE "${schemaName}"."housing-tenures" (
     "id" varchar(250) PRIMARY KEY REFERENCES "${schemaName}"."output-areas"("id"),
     "all_households" integer NOT NULL CHECK("all_households" >= 0),
     "owned" integer NOT NULL CHECK("owned" = "owned:outright" + "owned:with_mortgage_or_loan" and "owned" >= 0),
     "owned:outright" integer NOT NULL CHECK("owned:outright" >= 0),
     "owned:with_mortgage_or_loan" integer NOT NULL CHECK("owned:with_mortgage_or_loan" >= 0),
     "shared_ownership" integer NOT NULL CHECK("shared_ownership" >= 0),
     "social_rented" integer NOT NULL CHECK("social_rented" = "social_rented:from_local_authority" + "social_rented:from_other" and "social_rented" >= 0),
     "social_rented:from_local_authority" integer NOT NULL CHECK("social_rented:from_local_authority" >= 0),
     "social_rented:from_other" integer NOT NULL CHECK("social_rented:from_other" >= 0),
     "private_rented" integer NOT NULL CHECK("private_rented" = "private_rented:from_landlord_or_letting_agency" + "private_rented:from_other" and "private_rented" >= 0),
     "private_rented:from_landlord_or_letting_agency" integer NOT NULL CHECK("private_rented:from_landlord_or_letting_agency" >= 0),
     "private_rented:from_other" integer NOT NULL CHECK("private_rented:from_other" >= 0),
     "lives_rent_free" integer NOT NULL CHECK("lives_rent_free" >= 0)
  )`);
  // create 'economic-activity-statuses' table, TO DO: improve checks with summation
  await client.query(`CREATE TABLE "${schemaName}"."economic-activity-statuses" (
    "id" varchar(250) PRIMARY KEY REFERENCES "${schemaName}"."output-areas"("id"),
    "all_usual_residents_gte_16_years_of_age" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age" >= 0),

    "active:not_ft_student" integer NOT NULL CHECK ("active:not_ft_student" >= 0),
    "active:not_ft_student:unemployed" integer NOT NULL CHECK ("active:not_ft_student:unemployed" >= 0),
    "active:not_ft_student:employed" integer NOT NULL CHECK ("active:not_ft_student:employed" >= 0),

    "active:not_ft_student:employed:employee" integer NOT NULL CHECK ("active:not_ft_student:employed:employee" >= 0),
    "active:not_ft_student:employed:employee:ft" integer NOT NULL CHECK ("active:not_ft_student:employed:employee:ft" >= 0),
    "active:not_ft_student:employed:employee:pt" integer NOT NULL CHECK ("active:not_ft_student:employed:employee:pt" >= 0),

    "active:not_ft_student:employed:self_employed_no_employees" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_no_employees" >= 0),
    "active:not_ft_student:employed:self_employed_no_employees:ft" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_no_employees:ft" >= 0),
    "active:not_ft_student:employed:self_employed_no_employees:pt" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_no_employees:pt" >= 0),

    "active:not_ft_student:employed:self_employed_w_employees" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_w_employees" >= 0),
    "active:not_ft_student:employed:self_employed_w_employees:ft" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_w_employees:ft" >= 0),
    "active:not_ft_student:employed:self_employed_w_employees:pt" integer NOT NULL CHECK ("active:not_ft_student:employed:self_employed_w_employees:pt" >= 0),

    "active:ft_student" integer NOT NULL CHECK ("active:ft_student" >= 0),
    "active:ft_student:unemployed" integer NOT NULL CHECK ("active:ft_student:unemployed" >= 0),
    "active:ft_student:employed" integer NOT NULL CHECK ("active:ft_student:employed" >= 0),

    "active:ft_student:employed:employee" integer NOT NULL CHECK ("active:ft_student:employed:employee" >= 0),
    "active:ft_student:employed:employee:ft" integer NOT NULL CHECK ("active:ft_student:employed:employee:ft" >= 0),
    "active:ft_student:employed:employee:pt" integer NOT NULL CHECK ("active:ft_student:employed:employee:pt" >= 0),

    "active:ft_student:employed:self_employed_no_employees" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_no_employees" >= 0),
    "active:ft_student:employed:self_employed_no_employees:ft" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_no_employees:ft" >= 0),
    "active:ft_student:employed:self_employed_no_employees:pt" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_no_employees:pt" >= 0),

    "active:ft_student:employed:self_employed_w_employees" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_w_employees" >= 0),
    "active:ft_student:employed:self_employed_w_employees:ft" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_w_employees:ft" >= 0),
    "active:ft_student:employed:self_employed_w_employees:pt" integer NOT NULL CHECK ("active:ft_student:employed:self_employed_w_employees:pt" >= 0),

    "inactive" integer NOT NULL CHECK ("inactive" >= 0),
    "inactive:retired" integer NOT NULL CHECK ("inactive:retired" >= 0),
    "inactive:student" integer NOT NULL CHECK ("inactive:student" >= 0),
    "inactive:looking_after_home_or_family" integer NOT NULL CHECK ("inactive:looking_after_home_or_family" >= 0),
    "inactive:long_term_sickness_or_disabled" integer NOT NULL CHECK ("inactive:long_term_sickness_or_disabled" >= 0),
    "inactive:other" integer NOT NULL CHECK ("inactive:other" >= 0)
  )`);
  // create 'socio-economic-classifications' table;  National Statistics Socio-economic Classification (NS-SEC)
  await client.query(`CREATE TABLE "${schemaName}"."socio-economic-classifications" (
     "id" varchar(250) PRIMARY KEY REFERENCES "${schemaName}"."output-areas"("id"),
     "all_usual_residents_gte_16_years_of_age" integer NOT NULL CHECK ("all_usual_residents_gte_16_years_of_age" >= 0),
     "l1+l2+l3" integer NOT NULL CHECK("l1+l2+l3" >= 0),
     "l4+l5+l6" integer NOT NULL CHECK("l4+l5+l6" >= 0),
     "l7" integer NOT NULL CHECK("l7" >= 0),
     "l8+l9" integer NOT NULL CHECK("l8+l9" >= 0),
     "l10+l11" integer NOT NULL CHECK("l10+l11" >= 0),
     "l12" integer NOT NULL CHECK("l12" >= 0),
     "l13" integer NOT NULL CHECK("l13" >= 0),
     "l14.1|l14.2" integer NOT NULL CHECK("l14.1|l14.2" >= 0),
     "l15" integer NOT NULL CHECK("l15" >= 0)
  )`);
  // create the lookup table and indexes
  await client.query(`
    CREATE MATERIALIZED VIEW "${schemaName}"."output-area-to-postal-codes-lookup" AS (WITH "main" AS (SELECT
      "oa"."id",
      "oa"."oa_year",
      "oa"."oa_code",
      "oa"."lsoa_code",
      "oa"."lsoa_name",
      "oa"."msoa_code",
      "oa"."msoa_name",
      "oa"."lad_code",
      "oa"."lad_name",
      "oa"."lad_year",
      (
        (
          "t1"."all_usual_residents_gte_16_years_of_age" + "t3"."all_usual_residents_gte_16_years_of_age" + "t5"."all_usual_residents_gte_16_years_of_age"
        ) / 3
      ) AS "all_usual_residents_gte_16_years_of_age",
      "t2"."all_usual_residents_gte_16_years_of_age_in_employment",
      "t4"."all_households",
      "t1"."none" AS "highest_qualification:none",
      "t1"."level_1" AS "highest_qualification:level_1",
      "t1"."level_2" AS "highest_qualification:level_2",
      "t1"."apprenticeship" AS "highest_qualification:apprenticeship",
      "t1"."level_3" AS "highest_qualification:level_3",
      "t1"."gte_level_4" AS "highest_qualification:level_4+",
      "t1"."other" AS "highest_qualification:other",
      "t2"."managers_and_directors_and_senior_officials" AS "occupation:manager_or_director_or_senior_official",
      "t2"."professional_occupations" AS "occupation:professional",
      "t2"."associate_professional_and_technical_occupations" AS "occupation:associate_professional_or_technical",
      "t2"."administrative_and_secretarial_occupations" AS "occupation:administrative_or_secretarial",
      "t2"."skilled_trades_occupations" AS "occupation:skilled_trade",
      "t2"."caring_and_leisure_and_other_service_occupations" AS "occupation:caring_or_leisure_or_other_service",
      "t2"."sales_and_customer_service_occupations" AS "occupation:sales_or_customer_service",
      "t2"."process_and_plant_and_machine_operatives" AS "occupation:process_or_plant_or_machine_operative",
      "t2"."elementary_occupations" AS "elementary_occupation",
      "t3"."l1+l2+l3" AS "socioeconomic_class:l1_or_l2_or_l3",
      "t3"."l4+l5+l6" AS "socioeconomic_class:l4_or_l5_or_l6",
      "t3"."l7" AS "socioeconomic_class:l7",
      "t3"."l8+l9" AS "socioeconomic_class:l8+l9",
      "t3"."l10+l11" AS "socioeconomic_class:l10+l11",
      "t3"."l12" AS "socioeconomic_class:l12",
      "t3"."l13" AS "socioeconomic_class:l13",
      "t3"."l14.1|l14.2" AS "socioeconomic_class:l14.1_or_l14.2",
      "t3"."l15" AS "socioeconomic_class:l15",
      "t4"."owned" AS "housing_tenure:owned",
      "t4"."owned:outright" AS "housing_tenure:owned:outright",
      "t4"."owned:with_mortgage_or_loan" AS "housing_tenure:owned:with_mortgage_or_loan",
      "t4"."shared_ownership" AS "housing_tenure:shared_ownership",
      "t4"."social_rented" AS "housing_tenure:social_rented",
      "t4"."social_rented:from_local_authority" AS "housing_tenure:social_rented:from_local_authority",
      "t4"."social_rented:from_other" AS "housing_tenure:social_rented:from_other",
      "t4"."private_rented" AS "housing_tenure:private_rented",
      "t4"."private_rented:from_landlord_or_letting_agency" AS "housing_tenure:private_rented:from_landlord_or_letting_agency",
      "t4"."private_rented:from_other" AS "housing_tenure:private_rented:from_other",
      "t4"."lives_rent_free" AS "housing_tenure:lives_rent_free",
      "t5"."active:not_ft_student" AS "ea:active:not_ft_student",
      "t5"."active:not_ft_student:unemployed" AS "ea:active:not_ft_student:unemployed",
      "t5"."active:not_ft_student:employed" AS "ea:active:not_ft_student:employed",
      "t5"."active:not_ft_student:employed:employee" AS "ea:active:not_ft_student:employed:employee",
      "t5"."active:not_ft_student:employed:employee:ft" AS "ea:active:not_ft_student:employed:employee:ft",
      "t5"."active:not_ft_student:employed:employee:pt" AS "ea:active:not_ft_student:employed:employee:pt",
      "t5"."active:not_ft_student:employed:self_employed_no_employees" AS "ea:active:not_ft_student:employed:self_employed_no_employees",
      "t5"."active:not_ft_student:employed:self_employed_no_employees:ft" AS "ea:active:not_ft_student:employed:self_employed_no_employees:ft",
      "t5"."active:not_ft_student:employed:self_employed_no_employees:pt" AS "ea:active:not_ft_student:employed:self_employed_no_employees:pt",
      "t5"."active:not_ft_student:employed:self_employed_w_employees" AS "ea:active:not_ft_student:employed:self_employed_w_employees",
      "t5"."active:not_ft_student:employed:self_employed_w_employees:ft" AS "ea:active:not_ft_student:employed:self_employed_w_employees:ft",
      "t5"."active:not_ft_student:employed:self_employed_w_employees:pt" AS "ea:active:not_ft_student:employed:self_employed_w_employees:pt",
      "t5"."active:ft_student" AS "ea:active:ft_student",
      "t5"."active:ft_student:unemployed" AS "ea:active:ft_student:unemployed",
      "t5"."active:ft_student:employed" AS "ea:active:ft_student:employed",
      "t5"."active:ft_student:employed:employee" AS "ea:active:ft_student:employed:employee",
      "t5"."active:ft_student:employed:employee:ft" AS "ea:active:ft_student:employed:employee:ft",
      "t5"."active:ft_student:employed:employee:pt" AS "ea:active:ft_student:employed:employee:pt",
      "t5"."active:ft_student:employed:self_employed_no_employees" AS "ea:active:ft_student:employed:self_employed_no_employees",
      "t5"."active:ft_student:employed:self_employed_no_employees:ft" AS "ea:active:ft_student:employed:self_employed_no_employees:ft",
      "t5"."active:ft_student:employed:self_employed_no_employees:pt" AS "ea:active:ft_student:employed:self_employed_no_employees:pt",
      "t5"."active:ft_student:employed:self_employed_w_employees" AS "ea:active:ft_student:employed:self_employed_w_employees",
      "t5"."active:ft_student:employed:self_employed_w_employees:ft" AS "ea:active:ft_student:employed:self_employed_w_employees:ft",
      "t5"."active:ft_student:employed:self_employed_w_employees:pt" AS "ea:active:ft_student:employed:self_employed_w_employees:pt",
      "t5"."inactive" AS "ea:inactive",
      "t5"."inactive:retired" AS "ea:inactive:retired",
      "t5"."inactive:student" AS "ea:inactive:student",
      "t5"."inactive:looking_after_home_or_family" AS "ea:inactive:looking_after_home_or_family",
      "t5"."inactive:long_term_sickness_or_disabled" AS "ea:inactive:long_term_sickness_or_disabled",
      "t5"."inactive:other" AS "ea:inactive:other",
      ARRAY(SELECT "postal_code" FROM "${schemaName}"."postal-codes" where "postal-codes"."id" = "oa"."id") AS "postal_codes",
      COALESCE(ARRAY_LENGTH(ARRAY(SELECT "postal_code" FROM "${schemaName}"."postal-codes" where "postal-codes"."id" = "oa"."id"),1),0) AS "num_of_postal_codes"
    FROM
      "${schemaName}"."output-areas" AS "oa"
      INNER JOIN "${schemaName}"."highest-qualifications" AS "t1" ON "t1"."id" = "oa"."id"
      INNER JOIN "${schemaName}"."occupations" AS "t2" ON "t2"."id" = "oa"."id"
      INNER JOIN "${schemaName}"."socio-economic-classifications" AS "t3" ON "t3"."id" = "oa"."id"
      INNER JOIN "${schemaName}"."housing-tenures" AS "t4" ON "t4"."id" = "oa"."id"
      INNER JOIN "${schemaName}"."economic-activity-statuses" AS "t5" ON "t5"."id" = "oa"."id"
    ) SELECT * FROM "main" WHERE "num_of_postal_codes" > 0) WITH NO DATA;

    CREATE INDEX "by-lower-layer-super-output-area-code" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("lsoa_code");
    CREATE INDEX "by-lower-layer-super-output-area-name" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("lsoa_name");

    CREATE INDEX "by-middle-layer-super-output-area-code" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("msoa_code");
    CREATE INDEX "by-middle-layer-super-output-area-name" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("msoa_name");

    CREATE INDEX "by-local-area-district-code" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("lad_code");
    CREATE INDEX "by-local-area-district-name" ON "${schemaName}"."output-area-to-postal-codes-lookup" using hash ("lad_name");

    CREATE INDEX "by-postal-code" ON "${schemaName}"."output-area-to-postal-codes-lookup" using gin ("postal_codes");
  `);
  return schemaName;
}
