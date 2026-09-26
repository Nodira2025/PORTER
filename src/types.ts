export type Role = "admin" | "waiter" | "kitchen" | "cashier";
export type Status =
  "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  maps_url: string;
  reservation_url: string | null;
  transport_note: string;
  ordering_enabled: boolean;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  station: "kitchen" | "bar";
  active: boolean;
  tags: string[];
}
export interface Availability {
  branch_id: string;
  product_id: string;
  available: boolean;
  price_override: number | null;
}
export interface Recipe {
  product_id: string;
  ingredients: string;
  instructions: string;
  video_url: string | null;
}
export interface Table {
  id: string;
  branch_id: string;
  label: string;
  qr_token: string;
  active: boolean;
}
export interface Service {
  id: string;
  table_id: string;
  opened_at: string;
  closed_at: string | null;
}
export interface Guest {
  token: string;
  service_id: string;
  branch_id: string;
  label: string;
}
export interface Item {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  station: "kitchen" | "bar";
  note: string;
  status: "pending" | "preparing" | "ready";
}
export interface Order {
  id: string;
  number: number;
  branch_id: string;
  service_id: string;
  status: Status;
  total: number;
  note: string;
  payment_preference: string;
  payment_reference: string;
  created_at: string;
  order_items: Item[];
  paid?: number;
  guest_token?: string;
}
export interface Shift {
  id: string;
  branch_id: string;
  opening_amount: number;
  opened_at: string;
  closed_at: string | null;
  declared_cash?: number;
  expected_cash?: number;
}
export interface Payment {
  id: string;
  order_id: string;
  shift_id: string;
  amount: number;
  method: "cash" | "transfer";
  reference: string;
  created_at: string;
}
export interface Movement {
  id: string;
  shift_id: string;
  amount: number;
  reason: string;
  created_at: string;
}
export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  active: boolean;
}
export interface Reservation {
  id: string;
  branch_id: string;
  scheduled_at: string;
  guests: number;
  note: string;
  status: "requested" | "confirmed" | "cancelled";
}
export interface Dataset {
  branches: Branch[];
  products: Product[];
  availability: Availability[];
  recipes: Recipe[];
  tables: Table[];
  services: Service[];
  orders: Order[];
  shifts: Shift[];
  payments: Payment[];
  movements: Movement[];
  rewards: Reward[];
  points: { id: string; points: number; reason: string }[];
  claims: { id: string; title: string; code: string }[];
  reservations: Reservation[];
  loyalty: { enabled: boolean; pesos_per_point: number };
}
export interface CartLine {
  product_id: string;
  quantity: number;
  note: string;
}
