export interface Center {
  id: number;
  name: string;
  code?: string;
  center_type_id?: number;
  center_type_title?: string;
  specialty_id?: number;
  specialty_title?: string;
  province_id?: number;
  province_title?: string;
  city_id?: number;
  city_title?: string;
  address?: string;
  phone?: string;
  fax?: string;
  manager_name?: string;
  license_number?: string;
  is_active: boolean;
  doctors?: CenterDoctor[];
  contracts?: CenterContract[];
  created_at?: string;
  updated_at?: string;
}

export interface CenterDoctor {
  id: number;
  center_id: number;
  name: string;
  medical_code: string;
  specialty?: string;
  is_active: boolean;
}

export interface CenterContract {
  id: number;
  center_id: number;
  contract_number?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Settlement {
  id: number;
  settlement_number?: string;
  center_id?: number;
  center_name?: string;
  total_amount: number;
  approved_amount?: number;
  paid_amount?: number;
  status: string;
  status_title?: string;
  settlement_date?: string;
  payment_date?: string;
  created_at?: string;
}

export interface CommissionCase {
  id: number;
  case_number?: string;
  employee_id: number;
  employee_name?: string;
  claim_id?: number;
  description: string;
  verdict?: string;
  status: string;
  status_title?: string;
  commission_date?: string;
  created_at?: string;
}

export interface SocialWork {
  id: number;
  case_number?: string;
  employee_id: number;
  employee_name?: string;
  description: string;
  resolution?: string;
  status: string;
  status_title?: string;
  created_at?: string;
}
