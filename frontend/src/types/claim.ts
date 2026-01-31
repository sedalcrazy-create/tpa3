export interface Claim {
  id: number;
  claim_number?: string;
  employee_id: number;
  employee_name?: string;
  insurance_id?: number;
  center_id?: number;
  center_name?: string;
  claim_type_id?: number;
  claim_type_title?: string;
  status: string;
  status_title?: string;
  claim_date: string;
  total_amount?: number;
  approved_amount?: number;
  patient_share?: number;
  insurance_share?: number;
  description?: string;
  notes?: ClaimNote[];
  attachments?: ClaimAttachment[];
  invoices?: ClaimInvoice[];
  next_statuses?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ClaimNote {
  id: number;
  claim_id: number;
  user_id: number;
  user_name?: string;
  note: string;
  created_at: string;
}

export interface ClaimAttachment {
  id: number;
  claim_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  created_at: string;
}

export interface ClaimInvoice {
  id: number;
  claim_id: number;
  invoice_number?: string;
  total_amount: number;
  approved_amount?: number;
}
