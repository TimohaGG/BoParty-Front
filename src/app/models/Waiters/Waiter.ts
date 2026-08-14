export type StaffType = 'WAITER' | 'COOK';

export interface Staff {
  id: number;
  name: string;
  type: StaffType;
}

export interface StaffRequest {
  id?: number;
  name: string;
  type: StaffType;
}
