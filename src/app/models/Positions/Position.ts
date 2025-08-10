import {Category} from "./Category";
import {Ingredient} from "./Ingredient";
import {IngredientAmount} from "./IngredientAmount";

export class Position {
  public id:number;
  public name:string;
  public weight:number;
  public price:number;
  public category:Category;
  public image:string;
  public ingredients:IngredientAmount[];
  constructor(id:number,name:string,weight:number,price:number, category:Category, image:string, ingredients:IngredientAmount[]) {
    this.id=id;
    this.name=name;
    this.weight=weight;
    this.price=price;
    this.category=category;
    this.image=image;
    this.ingredients=ingredients;
  }



}
