import {Position} from "../Positions/Position";

export interface SelectedOrderPosition {
  id: number;
  amount: number;
  position: Position;
}
