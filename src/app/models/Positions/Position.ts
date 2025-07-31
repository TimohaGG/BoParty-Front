import {Category} from "./Category";

export class Position {
  public id:number;
  public name:string;
  public weight:number;
  public price:number;
  public category:Category;
  public image:string;
  constructor(id:number,name:string,weight:number,price:number, category:Category, image:string) {
    this.id=id;
    this.name=name;
    this.weight=weight;
    this.price=price;
    this.category=category;
    this.image=image;
  }



}
