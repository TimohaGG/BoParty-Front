import {BoxPosition} from "./BoxPosition";

export interface BoxAdditionalService {
  id?: number;
  text: string;
  price: number;
}

export interface Box {
  id: number;
  name: string;
  description: string;
  totalPrice: number;
  positions: BoxPosition[];
  additionalServices: BoxAdditionalService[];
}

export interface BoxRequest {
  id?: number | null;
  name: string;
  description: string;
  positions: Array<{
    positionId: number;
    amount: number;
  }>;
  additionalServices: Array<{
    text: string;
    price: number;
  }>;
}
