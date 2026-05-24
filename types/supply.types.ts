export type SupplyStatus = 'high' | 'medium' | 'low' | 'unavailable';

export interface SupplyEntry {
  id: string;
  product_id: string;
  vendor_id: string;
  location_id: string;
  quantity: number;
  price: number;
  submitted_at: string;
}

export interface SupplyMetric {
  product_id: string;
  location_id: string;
  status: SupplyStatus;
  avg_price: number;
  entry_count: number;
}
