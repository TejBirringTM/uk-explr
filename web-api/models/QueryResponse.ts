import { z } from "zod";
import { Code, Id, Name, Quantity } from "./generic";

const QueryRow = z.object({
  id: Id,
  oa_year: Quantity,
  oa_code: Code,
  lsoa_code: Code,
  lsoa_name: Name,
  msoa_code: Code,
  msoa_name: Name,
  lad_code: Code,
  lad_name: Name,
  lad_year: Quantity,
  all_usual_residents_gte_16_years_of_age: Quantity,
  all_usual_residents_gte_16_years_of_age_in_employment: Quantity,
  all_households: Quantity,
  "highest_qualification:none": Quantity,
  "highest_qualification:level_1": Quantity,
  "highest_qualification:level_2": Quantity,
  "highest_qualification:apprenticeship": Quantity,
  "highest_qualification:level_3": Quantity,
  "highest_qualification:level_4+": Quantity,
  "highest_qualification:other": Quantity,
  "occupation:manager_or_director_or_senior_official": Quantity,
  "occupation:professional": Quantity,
  "occupation:associate_professional_or_technical": Quantity,
  "occupation:administrative_or_secretarial": Quantity,
  "occupation:skilled_trade": Quantity,
  "occupation:caring_or_leisure_or_other_service": Quantity,
  "occupation:sales_or_customer_service": Quantity,
  "occupation:process_or_plant_or_machine_operative": Quantity,
  elementary_occupation: Quantity,
  "socioeconomic_class:l1_or_l2_or_l3": Quantity,
  "socioeconomic_class:l4_or_l5_or_l6": Quantity,
  "socioeconomic_class:l7": Quantity,
  "socioeconomic_class:l8+l9": Quantity,
  "socioeconomic_class:l10+l11": Quantity,
  "socioeconomic_class:l12": Quantity,
  "socioeconomic_class:l13": Quantity,
  "socioeconomic_class:l14.1_or_l14.2": Quantity,
  "socioeconomic_class:l15": Quantity,
  "housing_tenure:owned": Quantity,
  "housing_tenure:owned:outright": Quantity,
  "housing_tenure:owned:with_mortgage_or_loan": Quantity,
  "housing_tenure:shared_ownership": Quantity,
  "housing_tenure:social_rented": Quantity,
  "housing_tenure:social_rented:from_local_authority": Quantity,
  "housing_tenure:social_rented:from_other": Quantity,
  "housing_tenure:private_rented": Quantity,
  "housing_tenure:private_rented:from_landlord_or_letting_agency": Quantity,
  "housing_tenure:private_rented:from_other": Quantity,
  "housing_tenure:lives_rent_free": Quantity,
  "ea:active:not_ft_student": Quantity,
  "ea:active:not_ft_student:unemployed": Quantity,
  "ea:active:not_ft_student:employed": Quantity,
  "ea:active:not_ft_student:employed:employee": Quantity,
  "ea:active:not_ft_student:employed:employee:ft": Quantity,
  "ea:active:not_ft_student:employed:employee:pt": Quantity,
  "ea:active:not_ft_student:employed:self_employed_no_employees": Quantity,
  "ea:active:not_ft_student:employed:self_employed_no_employees:ft": Quantity,
  "ea:active:not_ft_student:employed:self_employed_no_employees:pt": Quantity,
  "ea:active:not_ft_student:employed:self_employed_w_employees": Quantity,
  "ea:active:not_ft_student:employed:self_employed_w_employees:ft": Quantity,
  "ea:active:not_ft_student:employed:self_employed_w_employees:pt": Quantity,
  "ea:active:ft_student": Quantity,
  "ea:active:ft_student:unemployed": Quantity,
  "ea:active:ft_student:employed": Quantity,
  "ea:active:ft_student:employed:employee": Quantity,
  "ea:active:ft_student:employed:employee:ft": Quantity,
  "ea:active:ft_student:employed:employee:pt": Quantity,
  "ea:active:ft_student:employed:self_employed_no_employees": Quantity,
  "ea:active:ft_student:employed:self_employed_no_employees:ft": Quantity,
  "ea:active:ft_student:employed:self_employed_no_employees:pt": Quantity,
  "ea:active:ft_student:employed:self_employed_w_employees": Quantity,
  "ea:active:ft_student:employed:self_employed_w_employees:ft": Quantity,
  "ea:active:ft_student:employed:self_employed_w_employees:pt": Quantity,
  "ea:inactive": Quantity,
  "ea:inactive:retired": Quantity,
  "ea:inactive:student": Quantity,
  "ea:inactive:looking_after_home_or_family": Quantity,
  "ea:inactive:long_term_sickness_or_disabled": Quantity,
  "ea:inactive:other": Quantity,
  postal_codes: Code.array(),
  num_of_postal_codes: Quantity,
});

const QueryResponse = z.object({
  length: z.number().int().gte(0),
  data: QueryRow.array(),
});

export default QueryResponse;
export type QueryResponse = z.infer<typeof QueryResponse>;
