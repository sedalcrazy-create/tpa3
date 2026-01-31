export interface Item {
  id: number;
  code: string;
  title: string;
  generic_name?: string;
  category_id?: number;
  category_title?: string;
  unit?: string;
  is_active: boolean;
  prices?: ItemPrice[];
  created_at?: string;
  updated_at?: string;
}

export interface ItemPrice {
  id: number;
  item_id: number;
  price: number;
  insurance_share_percent?: number;
  effective_date: string;
  end_date?: string;
  is_active: boolean;
}
