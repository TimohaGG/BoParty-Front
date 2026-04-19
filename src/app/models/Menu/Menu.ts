import {Position} from "../Positions/Position";
import {PositionAmount} from "../Positions/PositionAmount";
import {PositionAmountFull} from "../Positions/PositionAmountFull";
import {AdditionalMenuData} from "./AdditionalMenuData";

export interface Menu {
  id:number,
  client:string;
  guestsAmount:number;
  format:string;
  phone:string;
  date:string;
  duration:number;
  totalPrice:number;
  positions:PositionAmountFull[];
  additionalInfo:AdditionalMenuData[];
  payed:boolean;
}
