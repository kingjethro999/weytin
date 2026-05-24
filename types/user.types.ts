export type UserRole = 'user' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  location_id?: string;
  created_at: string;
}

export interface Vendor extends User {
  business_name: string;
  verification_status: 'pending' | 'verified' | 'rejected';
}
