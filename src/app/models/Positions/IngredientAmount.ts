import {UnitType} from "./Units";
import {Ingredient} from "./Ingredient";

export interface IngredientAmount{

  ingredient:Ingredient;
  amount:number;
  unit:UnitType
}
