import {Ingredient} from "../Positions/Ingredient";
import {ShoppingList} from "./ShoppingList";

export interface ShoppingListItem{
  id:number;
  ingredient:Ingredient;
  amount:number;
  bought:boolean;
  comment:string;
  unitName:string;
  loading:boolean;

}
