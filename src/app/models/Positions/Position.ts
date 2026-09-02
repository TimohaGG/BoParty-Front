import {Category} from "./Category";
import {Ingredient} from "./Ingredient";
import {IngredientAmount} from "./IngredientAmount";

export class Position {
  public id:number;
  public name:string;
  public description:string | null;
  public weight:number;
  public price:number;
  public minimumAmount:number;
  public category:Category;
  public imgUrl:string;
  public cookingImgUrl:string;
  public accessible:boolean;
  public archived:boolean;
  public ingredients:IngredientAmount[];
  constructor(id:number,name:string,description:string | null,weight:number,price:number, minimumAmount:number, category:Category, imgUrl:string, accessible:boolean, ingredients:IngredientAmount[], cookingImgUrl:string = '', archived:boolean = false) {
    this.id=id;
    this.name=name;
    this.description=description;
    this.weight=weight;
    this.price=price;
    this.minimumAmount=minimumAmount;
    this.category=category;
    this.imgUrl=imgUrl;
    this.cookingImgUrl=cookingImgUrl;
    this.accessible=accessible;
    this.archived=archived;
    this.ingredients=ingredients;
  }



}
