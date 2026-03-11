// types/domain.ts

export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  company_id: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  company_id: string;
};

export type Resource = {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
};

export type Reservation = {
  id: string;
  service_id: string;
  employee_id: string;
  customer_id: string | null;
  start_at: string; // ISO string
  end_at: string;   // ISO string
  note: string | null;
  company_id: string;
};

export type Settings = {
  id: string;
  company_id: string;
  opening_hours?: unknown; // můžeš později zpřesnit
};
