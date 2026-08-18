import {ShoppingListItem} from "./ShoppingListItem";
import {PositionAmountFull} from "../Positions/PositionAmountFull";

export interface ShoppingList{
  id:number;
  items:ShoppingListItem[];
  needsUpdate:boolean;
  positions:PositionAmountFull[];

}
