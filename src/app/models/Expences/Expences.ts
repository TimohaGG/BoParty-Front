import {StaffType} from "../Waiters/Waiter";

export interface ExpencesStaff {
  id: number;
  staffId: number | null;
  name: string | null;
  type: StaffType | null;
  price: number;
  payed: boolean;
}

export interface OtherExpences {
  id: number;
  name: string;
  amount: number;
}

export interface ShoppingSum {
  id: number;
  name: string;
  date: string | null;
  sum: number;
}

export interface Expences {
  id: number;
  menuId: number | null;
  client: string | null;
  date: string | null;
  staff: ExpencesStaff[];
  otherExpences: OtherExpences[];
  shoppingSums: ShoppingSum[];
}

export interface ExpencesStaffRequest {
  staffId: number;
  price: number;
  payed: boolean;
}

export interface OtherExpencesRequest {
  id?: number;
  name: string;
  amount: number;
}

export interface ShoppingSumRequest {
  id?: number;
  name: string;
  date: string | null;
  sum: number;
}

export interface ExpencesRequest {
  id?: number;
  menuId: number;
  staff: ExpencesStaffRequest[];
  otherExpences: OtherExpencesRequest[];
  shoppingSums: ShoppingSumRequest[];
}
