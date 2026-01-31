export interface Invoice {
  id: number;
  invoice_number?: string;
  claim_id?: number;
  center_id?: number;
  center_name?: string;
  employee_id?: number;
  employee_name?: string;
  invoice_date: string;
  total_amount: number;
  approved_amount?: number;
  insurance_share?: number;
  patient_share?: number;
  deductions?: number;
  discount?: number;
  status: string;
  status_title?: string;
  items?: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  approved_price?: number;
  insurance_share?: number;
  patient_share?: number;
  deduction?: number;
  discount?: number;
  description?: string;
}
