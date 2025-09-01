import {Position} from "../Positions/Position";
import {PositionAmount} from "../Positions/PositionAmount";
import {PositionAmountFull} from "../Positions/PositionAmountFull";
import {AdditionalOrderData} from "./AdditionalOrderData";

export interface Order{
  id:number,
  client:string;
  guestsAmount:number;
  format:string;
  phone:string;
  date:string;
  duration:number;
  totalPrice:number;
  positions:PositionAmountFull[];
  additionalInfo:AdditionalOrderData[];
}
