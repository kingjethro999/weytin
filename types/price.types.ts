export interface PriceRule {
  id: string;
  product_id: string;
  location_id: string;
  min_price: number;
  max_price: number;
  updated_by: string;
  updated_at: string;
}

export interface PriceFlag {
  id: string;
  supply_entry_id: string;
  reported_by: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export interface PriceStats {
  avg: number;
  median: number;
  min: number;
  max: number;
  is_outlier: boolean;
}
