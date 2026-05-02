import {ShoppingListItem} from "./ShoppingListItem";

export interface ShoppingList{
  id:number;
  items:ShoppingListItem[];
  needsUpdate:boolean;

}
