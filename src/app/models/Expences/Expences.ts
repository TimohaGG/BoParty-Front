export interface ExpencesWaiter {
  id: number;
  waiterId: number | null;
  name: string | null;
  price: number;
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
  cook: number;
  waiters: ExpencesWaiter[];
  otherExpences: OtherExpences[];
  shoppingSums: ShoppingSum[];
}

export interface ExpencesWaiterRequest {
  waiterId: number;
  price: number;
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
  cook: number;
  waiters: ExpencesWaiterRequest[];
  otherExpences: OtherExpencesRequest[];
  shoppingSums: ShoppingSumRequest[];
}
