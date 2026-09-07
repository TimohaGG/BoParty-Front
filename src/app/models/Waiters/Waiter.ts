export type StaffType = string;

export interface StaffCategory {
  id: number | null;
  name: string;
  code: StaffType;
}

export interface Staff {
  id: number;
  name: string;
  type: StaffType;
  cookPercent: number;
}

export interface StaffRequest {
  id?: number;
  name: string;
  type: StaffType;
  cookPercent: number;
}
