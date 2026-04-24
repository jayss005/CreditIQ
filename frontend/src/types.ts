/** Shared TypeScript interfaces for CreditIQ. */

export interface ApplicantData {
  code_gender: number;
  flag_own_car: number;
  flag_own_realty: number;
  cnt_children: number;
  amt_income_total: number;
  name_income_type: string;
  name_education_type: string;
  name_family_status: string;
  name_housing_type: string;
  flag_work_phone: number;
  flag_phone: number;
  flag_email: number;
  occupation_type: string;
  cnt_fam_members: number;
  age_years: number | "";
  years_employed: number | "";
}

export interface PredictionResponse {
  prediction: number;
  probability_approved: number;
  probability_rejected: number;
}

export interface PredictionState {
  loading: boolean;
  result: PredictionResponse | null;
  error: string | null;
}

export const INCOME_TYPES = [
  "Working",
  "Commercial associate",
  "Pensioner",
  "State servant",
  "Student",
] as const;

export const EDUCATION_TYPES = [
  "Secondary / secondary special",
  "Higher education",
  "Incomplete higher",
  "Lower secondary",
  "Academic degree",
] as const;

export const FAMILY_STATUSES = [
  "Married",
  "Single / not married",
  "Civil marriage",
  "Separated",
  "Widow",
] as const;

export const HOUSING_TYPES = [
  "House / apartment",
  "Rented apartment",
  "With parents",
  "Municipal apartment",
  "Office apartment",
  "Co-op apartment",
] as const;

export const OCCUPATION_TYPES = [
  "Unknown",
  "Accountants",
  "Cleaning staff",
  "Cooking staff",
  "Core staff",
  "Drivers",
  "HR staff",
  "High skill tech staff",
  "IT staff",
  "Laborers",
  "Low-skill Laborers",
  "Managers",
  "Medicine staff",
  "Private service staff",
  "Realty agents",
  "Sales staff",
  "Secretaries",
  "Security staff",
  "Waiters/barmen staff",
] as const;

export function getDefaultApplicant(): ApplicantData {
  return {
    code_gender: 0,
    flag_own_car: 0,
    flag_own_realty: 0,
    cnt_children: 0,
    amt_income_total: 300000,
    name_income_type: "Working",
    name_education_type: "Higher education",
    name_family_status: "Married",
    name_housing_type: "House / apartment",
    flag_work_phone: 0,
    flag_phone: 0,
    flag_email: 0,
    occupation_type: "Unknown",
    cnt_fam_members: 2,
    age_years: 35,
    years_employed: 5,
  };
}
