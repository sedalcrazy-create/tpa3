export interface Insurance {
  id: number;
  employee_id: number;
  employee_name?: string;
  insurance_number?: string;
  insurance_type_id?: number;
  insurance_type_title?: string;
  start_date: string;
  end_date: string;
  ceiling_amount?: number;
  used_amount?: number;
  remaining_amount?: number;
  status: string;
  status_title?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceInquiry {
  national_code: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    national_code: string;
  };
  insurance?: Insurance;
  is_valid: boolean;
  message?: string;
}
