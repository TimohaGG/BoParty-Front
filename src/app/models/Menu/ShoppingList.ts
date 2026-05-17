import {ShoppingListItem} from "./ShoppingListItem";
import {Position} from "../Positions/Position";

export interface ShoppingList{
  id:number;
  items:ShoppingListItem[];
  needsUpdate:boolean;
  positions:Position[];

}
