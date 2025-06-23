// types/index.ts
export type TeeTime = {
  id: string;
  start_time: string;
  players_count: number;
  notes: string | null;
  guest_count?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  total_cost?: number;
};

export type DiningReservation = {
  id: string;
  member_id: string;
  table_id: string;
  reservation_datetime: string;
  party_size: number;
  duration_minutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  guest_count: number;
  special_requests?: string;
  created_at: string;
  updated_at: string;
};

export type DiningVenue = {
  id: string;
  name: string;
  resource_type: string;
  description?: string;
  capacity: number;
  booking_interval_minutes: number;
  advance_booking_days: number;
  active: boolean;
};

export type DiningTable = {
  id: string;
  resource_id: string;
  table_number: string;
  capacity: number;
  location: string;
  active: boolean;
};

export type Guest = {
  id: string;
  member_sponsor_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  visit_count: number;
  total_fees_paid: number;
  restrictions?: string[];
};

export type Profile = {
  id: string;
  full_name?: string;
  phone?: string;
  email?: string;
  member_number?: string;
  member_status: "active" | "inactive" | "suspended" | "pending";
  membership_tier: string;
  date_joined?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  dietary_restrictions?: string[];
  notes?: string;
};

export type ClubSettings = {
  id: string;
  setting_key: string;
  setting_value: any; // JSONB field
  description?: string;
  updated_at: string;
};

export type TimeSlot = {
  time: string;
  available: boolean;
  available_tables_count?: number;
};
