export type DemandEventType = 'search' | 'view' | 'alert_signup';

export interface DemandEvent {
  id: string;
  product_id: string;
  location_id: string;
  user_id?: string;
  event_type: DemandEventType;
  created_at: string;
}

export interface DemandScore {
  product_id: string;
  location_id: string;
  score: number; // Calculated demand score
  trend: 'up' | 'down' | 'stable';
}
