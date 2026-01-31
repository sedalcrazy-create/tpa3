export interface Employee {
  id: number;
  personnel_code?: string;
  national_code: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  father_name?: string;
  gender: { value: string; label: string } | null;
  birth_date?: string;
  birth_date_jalali?: string;
  id_number?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  status: { value: string; label: string } | null;
  employment_date?: string;
  employment_date_jalali?: string;
  retirement_date?: string;
  bank_account_number?: string;
  iban?: string;
  is_head_of_family?: boolean;
  is_active: boolean;
  priority?: number;
  description?: string;
  photo?: string;
  branch_id?: number;
  bazneshasegi_date?: string;
  hoghogh_branch_id?: number;

  // Nested relations (from EmployeeResource)
  province?: { id: number; name: string } | null;
  location?: { id: number; name: string; code?: string } | null;
  custom_employee_code?: { id: number; code: string; title: string } | null;
  special_employee_type?: { id: number; code: string; title: string } | null;
  relation_type?: { id: number; code: string; title: string } | null;
  guardianship_type?: { id: number; code: string; title: string } | null;
  marriage_status?: { id: number; code: string; title: string } | null;
  location_work?: { id: number; name: string; code?: string } | null;
  parent?: { id: number; full_name: string; personnel_code: string } | null;
  active_insurance?: {
    id: number;
    insurance_number: string;
    status: string;
    annual_ceiling: number;
    remaining_amount: number;
  } | null;

  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFamily {
  id: number;
  personnel_code?: string;
  national_code: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  gender: { value: string; label: string } | null;
  birth_date?: string;
  birth_date_jalali?: string;
  relation_type?: { id: number; title: string; code?: string } | null;
  status?: { value: string; label: string } | null;
  is_active: boolean;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  father_name?: string;
  national_code: string;
  personnel_code?: string;
  custom_employee_code_id?: string;
  special_employee_type_id?: string;
  relation_type_id?: string;
  guardianship_type_id?: string;
  marriage_status_id?: string;
  parent_id?: string;
  gender?: string;
  location_id?: string;
  location_work_id?: string;
  province_id?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  bank_account_number?: string;
  id_number?: string;
  address?: string;
  birth_date?: string;
  employment_date?: string;
  branch_id?: string;
  priority?: string;
  description?: string;
  photo?: File | null;
  status?: string;
  is_active: boolean;
}
