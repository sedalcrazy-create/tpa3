export interface LookupItem {
  id: number;
  title: string;
  code?: string;
}

export interface Province extends LookupItem {
  cities?: City[];
}

export interface City extends LookupItem {
  province_id: number;
}

export interface RelationType extends LookupItem {}
export interface GuardianshipType extends LookupItem {}
export interface SpecialType extends LookupItem {}
export interface Gender extends LookupItem {}
export interface EmployeeStatus extends LookupItem {}
export interface InsuranceType extends LookupItem {}
export interface ClaimStatus extends LookupItem {}
export interface ClaimType extends LookupItem {}
export interface ItemCategory extends LookupItem {}
export interface CenterType extends LookupItem {}
export interface CenterSpecialty extends LookupItem {}
